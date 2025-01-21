const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const cors = require("cors");
const fs = require("fs");

app.use(bodyParser.json()); // for parsing application/json

const usersFile = path.join(__dirname, "users.json"); // 사용자 데이터를 저장할 파일
const postsFile = path.join(__dirname, "posts.json"); // 사용자 데이터를 저장할 파일
let users = [];

if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

// CORS 설정
app.use(cors());

// 게시물 데이터를 저장할 배열
let posts = [];

// POST 데이터를 처리하기 위한 설정
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// 서버 실행
app.listen(1313, function () {
  console.log("서버가 실행 중입니다: http://localhost:1313");
});

// 기본 페이지
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// "게시물 읽기" 페이지
app.get("/read", function (req, res) {
  res.send("게시물을 읽는 페이지 입니다.");
});

// 특정 작성자용 페이지
app.get("/write/:name", (req, res) => {
  const { name } = req.params;

  // 작성자에 따른 다른 HTML 파일 제공
  const allowedNames = [
    "Jibi",
    "Jini",
    "Seobin",
    "Beobi",
    "Ddonggae",
    "Namgyu",
    "Seoyeon",
    "Yumin",
  ];
  if (allowedNames.includes(name)) {
    res.sendFile(path.join(__dirname, "public", `write${name}.html`));
  } else {
    res.status(404).send("작성자를 찾을 수 없습니다.");
  }
});

app.delete("/post/:index", (req, res) => {
  const index = parseInt(req.params.index, 10); // index를 숫자로 변환
  const { username } = req.body;

  const post = posts[index];
  if (!post) {
    return res.status(404).send("게시물을 찾을 수 없습니다.");
  }

  const formattedUsername = username.trim().toLowerCase();
  const postUsername = post.username.trim().toLowerCase();

  if (postUsername !== formattedUsername) {
    return res.status(403).send("삭제 권한이 없습니다.");
  }

  posts.splice(index, 1);
  fs.writeFileSync(usersFile, JSON.stringify(posts, null, 2));

  res.status(200).send("게시물이 삭제되었습니다.");
});

// 게시물 작성 (POST 요청)
app.post("/post", (req, res) => {
  console.log(req.body, req.body.title);

  const { title, description, username, category } = req.body;

  if (!title || !description || !username || !category) {
    return res.status(400).send("제목, 내용, 그리고 사용자 이름을 입력하세요.");
  }

  // 게시물 저장
  const post = {
    title,
    description,
    username, // 게시물 작성자
    category,
    timestamp: new Date(),
  };

  posts.push(post);

  // 게시물 저장 후 파일에 기록
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

  res.status(201).send("게시물 작성 완료!");
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

// 게시물 리스트 제공 (GET 요청)
app.get("/posts", (req, res) => {
  res.json(posts); // 저장된 게시물을 JSON 형식으로 반환
});

// Write 페이지
app.get("/write", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "write.html"));
});
