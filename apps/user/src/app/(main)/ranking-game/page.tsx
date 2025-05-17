"use client"

import {Button} from "@gameverse/ui";

const RankingGame = () => {
 return(
   <div className="w-full min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">랭크게임을 시작합니다</h1>
     
            <Button
              variant="primary"
              size="lg"
              width="w-1/3"
            >
              랭킹 게임 시작하기
            </Button>
            
          <br/>
          <p className="text-xl font-bold text-gray-800 mb-6">랭킹 게임은 랜덤으로 플레이어를 만나게임을 합니다.</p>
   </div>
 )   
}

export default RankingGame;