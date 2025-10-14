import axios from "axios";

async function joinMatch(gameName: string, userId: string, userName: string) {
  try {
    const res = await axios.post("http://localhost:8080/api/match/join", {
      userId,
      userName,
      gameName,
    });

    const data = res.data;

    if (data.status === "matched") {
      console.log("매칭 성공:", data.roomId, data.players);
    } else {
      console.log("대기 중...");
    }
  } catch (err) {
    console.error("매칭 실패:", err);
  }
}
