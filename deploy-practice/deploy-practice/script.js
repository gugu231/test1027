// 배포 연습 페이지: 어디서 열렸는지, 파일이 다 올라갔는지 확인합니다.
(function () {
  var rows = {};
  document.querySelectorAll('[data-check]').forEach(function (li) {
    rows[li.dataset.check] = li;
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var order = ['css', 'js', 'img', 'page', 'https'];
  var results = {};
  var started = false;

  function setRow(key, status, text) {
    var li = rows[key];
    if (!li) return;
    li.querySelector('.lamp').className = 'lamp ' + status;
    li.querySelector('.state').textContent = text;
  }

  // 결과가 다 모이면 표시등을 순서대로 켭니다.
  function report(key, status, text) {
    results[key] = { status: status, text: text };
    if (started || order.some(function (k) { return !results[k]; })) return;
    started = true;
    order.forEach(function (k, i) {
      var r = results[k];
      if (reduceMotion) { setRow(k, r.status, r.text); return; }
      setTimeout(function () { setRow(k, r.status, r.text); }, 200 + i * 220);
    });
  }

  // 1. 어느 플랫폼에서 열렸는지
  var host = location.hostname;
  var proto = location.protocol;
  var hostText = host;
  var platform, note;

  if (proto === 'file:') {
    hostText = '내 컴퓨터';
    platform = '아직 배포 전';
    note = '파일을 더블클릭해서 연 상태입니다. 업로드한 뒤 받은 주소로 다시 열어 보세요.';
  } else if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
    platform = '내 컴퓨터의 테스트 서버';
    note = '로컬 서버에서 열렸습니다. 배포 전 미리보기로 쓰기 좋습니다.';
  } else if (/\.github\.io$/.test(host)) {
    platform = 'GitHub Pages에서 열렸습니다';
    note = '저장소에 올린 파일을 GitHub가 웹으로 보여주고 있습니다.';
  } else if (/\.netlify\.app$/.test(host)) {
    platform = 'Netlify에서 열렸습니다';
    note = 'Netlify가 올린 폴더를 웹으로 보여주고 있습니다.';
  } else if (/\.(pages|workers)\.dev$/.test(host)) {
    platform = 'Cloudflare에서 열렸습니다';
    note = 'Cloudflare Pages(또는 Workers)가 이 파일을 보여주고 있습니다.';
  } else {
    platform = '직접 연결한 도메인';
    note = '위 세 플랫폼의 기본 주소가 아닙니다. 따로 연결한 도메인일 수 있습니다.';
  }

  document.getElementById('host').textContent = hostText;
  document.getElementById('platform').textContent = platform;
  document.getElementById('hostNote').textContent = note;

  // 2. style.css
  var cssOk = getComputedStyle(document.documentElement).getPropertyValue('--css-check').trim() === 'ok';
  report('css', cssOk ? 'on' : 'bad',
    cssOk ? '적용되었습니다' : '적용되지 않음 — style.css가 index.html과 같은 위치에 있는지 확인하세요');

  // 3. script.js (이 코드가 실행됐다면 성공)
  report('js', 'on', '작동합니다');

  // 4. 이미지
  var logo = document.getElementById('logo');
  function imgDone(ok) {
    report('img', ok ? 'on' : 'bad',
      ok ? '불러왔습니다' : '찾을 수 없음 — images 폴더가 함께 올라갔는지, 이름 대소문자가 맞는지 확인하세요');
  }
  if (logo.complete) {
    imgDone(logo.naturalWidth > 0);
  } else {
    logo.addEventListener('load', function () { imgDone(true); });
    logo.addEventListener('error', function () { imgDone(false); });
  }

  // 5. 하위 폴더 페이지
  if (proto === 'file:') {
    report('page', 'warn', '내 컴퓨터에서는 확인할 수 없습니다. 배포한 뒤 다시 보세요');
  } else {
    fetch('pages/second.html', { cache: 'no-store' })
      .then(function (res) {
        if (res.ok) report('page', 'on', '하위 폴더까지 올라갔습니다');
        else report('page', 'bad', '찾을 수 없음 (' + res.status + ') — pages 폴더가 함께 올라갔는지 확인하세요');
      })
      .catch(function () {
        report('page', 'bad', '확인 실패 — 네트워크 상태를 확인하세요');
      });
  }

  // 6. HTTPS
  if (proto === 'https:') report('https', 'on', '보안 연결로 열렸습니다');
  else if (proto === 'file:') report('https', 'warn', '배포하면 자동으로 켜집니다');
  else report('https', 'warn', '보안 연결이 아닙니다 (http)');

  // 수정 시각
  var mod = new Date(document.lastModified);
  if (!isNaN(mod)) {
    document.getElementById('modified').textContent = mod.toLocaleString('ko-KR');
  }
})();
