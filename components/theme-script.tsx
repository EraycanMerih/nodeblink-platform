"use client";

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          "(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var s=(t==='light'||t==='dark')?t:(m?'dark':'light');document.documentElement.classList.toggle('dark',s==='dark');}catch(e){}})();",
      }}
    />
  );
}

