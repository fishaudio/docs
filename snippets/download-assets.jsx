import { useState } from 'react';

export const DownloadAssets = () => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="my-6">
      <div className="flex items-center gap-3 mb-4">
        <input
          type="checkbox"
          id="agree-guidelines"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="agree-guidelines" className="text-sm cursor-pointer">
          I agree to the usage guidelines above
        </label>
      </div>
      <a
        href="https://drive.google.com/drive/folders/1GYsYXDtzx1es7xEHOaTdlIleTCDoXufB"
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!agreed}
        tabIndex={agreed ? 0 : -1}
        style={{
          opacity: agreed ? 1 : 0.5,
          cursor: agreed ? 'pointer' : 'not-allowed'
        }}
        className="mint-inline-flex mint-items-center mint-px-7 mint-py-3 mint-text-base mint-font-medium mint-rounded-full !mint-text-white mint-bg-gray-900 hover:mint-bg-gray-800 mint-shadow-lg hover:mint-shadow-xl mint-transition-all mint-duration-200 dark:mint-bg-gray-100 dark:!mint-text-gray-900 dark:hover:mint-bg-white"
        onClick={(e) => {
          if (!agreed) {
            e.preventDefault();
          }
        }}
      >
        Download Brand Assets
      </a>
    </div>
  );
};