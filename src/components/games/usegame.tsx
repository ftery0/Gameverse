import Omok from './omoku';

interface GameInformation {
  mode: 'easy' | 'normal' | 'hard';
  id: string;
}


export const getGameComponent = ({ mode, id }: GameInformation) => {
  switch (id) {
    case 'omok':
      return <Omok mode={mode} />;
    default:
      return <div>존재하지 않는 게임입니다.</div>;
  }
};
