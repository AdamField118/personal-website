// Click-to-load YouTube embeds: shows only a thumbnail until the visitor
// presses play, avoiding ~1 MB of player JavaScript on page load.
document.querySelectorAll('.yt-facade').forEach(facade => {
    const play = () => {
        const id = facade.dataset.videoId;
        const title = facade.dataset.title || 'YouTube video';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
        iframe.title = title;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        facade.innerHTML = '';
        facade.appendChild(iframe);
        facade.classList.add('yt-facade-active');
    };
    facade.querySelector('.yt-facade-play').addEventListener('click', play);
});
