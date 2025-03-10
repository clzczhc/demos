// darkreader-loader.js
(function () {
  // 动态加载 DarkReader
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/darkreader/darkreader.min.js";
  script.onload = () => {
    // 确保 DarkReader 加载完成后执行
    DarkReader.enable();
  };
  document.head.appendChild(script);
})();
