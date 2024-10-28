if (navigator.onLine) {
    const remoteScript = document.createElement('script');
    remoteScript.src = './Annenberg_HotKeys_v4.js';
    document.head.appendChild(remoteScript);
} else {
    const localScript = document.createElement('script');
    localScript.src = 'Annenberg_HotKeys_v4.js';
    document.head.appendChild(localScript);
}
