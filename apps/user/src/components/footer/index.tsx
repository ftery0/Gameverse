'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="flex flex-col justify-between w-full min-h-min p-6 gap-10 bg-gray-100">
      <div className="flex w-full justify-between flex-wrap md:flex-col md:gap-6">
        
        <div className="flex flex-wrap items-start gap-4 mr-2 md:w-full md:flex-col">
          <span className="text-sm text-gray-600">이해준</span>
          <span className="text-sm text-gray-600">대구소프트웨어마이스터고등학교</span>
          <span className="text-sm text-gray-600">이메일 : lerb5253@dgsw.hs.kr</span>
        </div>

        <div className="flex gap-10 md:w-full md:flex-col">
          <div className="flex flex-col gap-2 w-24">
            <Link href="/inquiry" className="text-sm font-semibold text-gray-800 hover:underline">
              문의
            </Link>
          </div>
          <div className="flex flex-col gap-2 w-24">
            <Link
              href="https://github.com/ftery0/Gomoku"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-800 hover:underline"
            >
              깃허브
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
