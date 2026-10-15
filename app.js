// Shared by the home page and the Nobody Online page.

document.getElementById('year').textContent = new Date().getFullYear();


// ---------------------------------------------------------------------------
// Card tilt: rotate toward the cursor, like tilting a physical card
// ---------------------------------------------------------------------------

function attachTilt(el, strength = 10) {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateY(-3px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
}

document.querySelectorAll('.card:not(.no-tilt)').forEach((card) => attachTilt(card));
const aboutGrid = document.querySelector('.about-grid');
if (aboutGrid) attachTilt(aboutGrid, 3);


// ---------------------------------------------------------------------------
// Project popup
//
// Each .proj-card holds its own <template> with the extra detail (screenshot,
// chips, link). The popup is built from the card's title and blurb plus that
// template. <dialog> handles Esc and focus for us.
// ---------------------------------------------------------------------------

const lightbox = document.getElementById('lightbox');
const lightboxContent = lightbox.querySelector('.lightbox-content');

function openLightbox(card) {
  const details = card.querySelector('template').content.cloneNode(true);
  lightboxContent.replaceChildren(
    details.querySelector('.shot'),
    card.querySelector('h3').cloneNode(true),
    card.querySelector('p').cloneNode(true),
    details // whatever is left: extra text, chips, link
  );
  lightbox.showModal();
  lightboxContent.querySelector('video')?.play();
}

document.querySelectorAll('.proj-card').forEach((card) => {
  card.addEventListener('click', () => openLightbox(card));
});

// Nobody Online gallery: plain links to the full image, shown in the same popup when JS runs.
document.querySelectorAll('.gallery a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const shot = document.createElement('div');
    shot.className = 'shot';
    const img = link.querySelector('img');
    const caption = document.createElement('p');
    caption.textContent = img.alt;
    shot.append(img.cloneNode());
    lightboxContent.replaceChildren(shot, caption);
    lightbox.showModal();
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
// the <dialog> has no padding, so a click whose target is the dialog itself hit the backdrop
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});
// stop any video when the popup closes
lightbox.addEventListener('close', () => lightboxContent.replaceChildren());


// ---------------------------------------------------------------------------
// Discord community card: live online count, avatars and invite from the
// server's public widget. If the fetch fails the card keeps its static
// fallback link to Discord's own widget page.
// ---------------------------------------------------------------------------

if (document.getElementById('discordJoin')) {
  fetch('https://discord.com/api/guilds/1560032346978259037/widget.json')
    .then((r) => r.json())
    .then((data) => {
      document.getElementById('discordOnline').textContent = `${data.presence_count} online`;
      if (data.instant_invite) document.getElementById('discordJoin').href = data.instant_invite;
      document.getElementById('discordMembers').replaceChildren(
        ...data.members.slice(0, 8).map((m) => {
          const li = document.createElement('li');
          li.className = m.status;
          li.title = m.game ? `${m.username} - playing ${m.game.name}` : m.username;
          const img = document.createElement('img');
          img.src = m.avatar_url;
          img.alt = m.username;
          li.append(img);
          return li;
        })
      );
    })
    .catch(() => {});
}
