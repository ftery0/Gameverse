

interface OmokProps {
    mode: 'easy' | 'normal' | 'hard';
  }
  
  const Omok = ({ mode }: OmokProps) => {
    return (
      <div>
        <h2>오목 게임 - 현재 난이도: {mode}</h2>
        
      </div>
    );
  };
  
  export default Omok;
  