const form = document.getElementById('resumeForm');
const preview = document.getElementById('preview');
const themeSelect = document.getElementById('theme-select');
const fontSelect = document.getElementById('font-select');
const loader = document.getElementById('loader');

// Load saved data on page load
window.onload = function () {
  const saved = JSON.parse(localStorage.getItem('resumeData') || '{}');
  const fields = ['name', 'email', 'phone', 'summary', 'skills'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && saved[id]) el.value = saved[id];
  });
  updatePreview();
};

// Auto-save every 2 seconds
setInterval(() => {
  const data = {
    name: document.getElementById('name')?.value,
    email: document.getElementById('email')?.value,
    phone: document.getElementById('phone')?.value,
    summary: document.getElementById('summary')?.value,
    skills: document.getElementById('skills')?.value
  };
  localStorage.setItem('resumeData', JSON.stringify(data));
}, 2000);

// Theme & Font Switching
themeSelect.addEventListener('change', () => {
  document.body.className = `${themeSelect.value} ${fontSelect.value}`;
});
fontSelect.addEventListener('change', () => {
  document.body.className = `${themeSelect.value} ${fontSelect.value}`;
});

// Update preview and progress
form.addEventListener('input', () => {
  updatePreview();
  updateProgress();
});

function updatePreview() {
  const name = document.getElementById('name')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const summary = document.getElementById('summary')?.value || '';
  const skills = document.getElementById('skills')?.value.split(',').map(s => s.trim()).filter(Boolean);

  const experiences = [...document.querySelectorAll('.exp-block')].map(block => ({
    title: block.querySelector('.exp-title')?.value || '',
    company: block.querySelector('.exp-company')?.value || '',
    duration: block.querySelector('.exp-duration')?.value || '',
    desc: block.querySelector('.exp-desc')?.value || ''
  }));

  const projects = [...document.querySelectorAll('.proj-block')].map(block => ({
    title: block.querySelector('.proj-title')?.value || '',
    desc: block.querySelector('.proj-desc')?.value || '',
    tech: block.querySelector('.proj-tech')?.value || '',
    link: block.querySelector('.proj-link')?.value || '',
    github: block.querySelector('.proj-github')?.value || ''
  }));

  preview.innerHTML = `
    <div class="resume-card-content">
      <h2>${name}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <div><strong>Summary:</strong><p>${summary}</p></div>

      <h3>Skills</h3>
      <ul>${skills.map(s => `<li>${s}</li>`).join('')}</ul>

      <h3>Experience</h3>
      <div id="preview-exp">${experiences.map(e => `
        <div class="exp-entry">
          <div class="exp-header">
            <span class="job-title">${e.title}</span>
            <span class="company-duration">${e.company} | ${e.duration}</span>
          </div>
          <div class="exp-description">${e.desc}</div>
        </div>
      `).join('')}</div>

      <h3>Projects</h3>
      <div id="preview-proj">${projects.map(p => `
        <div>
          <strong>${p.title}</strong>
          <p>${p.desc}</p>
          <small>${p.tech}</small><br>
          ${p.link ? `<a href="${p.link}" target="_blank">Live</a>` : ''}
          ${p.github ? ` | <a href="${p.github}" target="_blank">GitHub</a>` : ''}
        </div>
      `).join('')}</div>
    </div>
  `;

  setTimeout(() => {
    if (window.Sortable) {
      new Sortable(document.getElementById("preview-exp"), { animation: 150 });
      new Sortable(document.getElementById("preview-proj"), { animation: 150 });
    }
  }, 100);
}

function updateProgress() {
  const inputs = form.querySelectorAll('input, textarea');
  const total = inputs.length;
  let filled = 0;
  inputs.forEach(input => {
    if (input.value.trim() !== "") filled++;
  });
  const percent = Math.round((filled / total) * 100);
  document.getElementById('progress-bar').style.width = percent + '%';
}

function addExperience() {
  const container = document.getElementById('experience-section');
  const div = document.createElement('div');
  div.className = 'exp-block';
  div.innerHTML = `
    <input type="text" class="exp-title" placeholder="Job Title" />
    <input type="text" class="exp-company" placeholder="Company" />
    <input type="text" class="exp-duration" placeholder="Duration" />
    <textarea class="exp-desc" placeholder="Job Description"></textarea>
  `;
  container.insertBefore(div, container.lastElementChild);
  restoreListeners();
}

function addProject() {
  const container = document.getElementById('projects-section');
  const div = document.createElement('div');
  div.className = 'proj-block';
  div.innerHTML = `
    <input type="text" class="proj-title" placeholder="Project Title" />
    <textarea class="proj-desc" placeholder="Description"></textarea>
    <input type="text" class="proj-tech" placeholder="Tech Stack" />
    <input type="text" class="proj-link" placeholder="Live Link" />
    <input type="text" class="proj-github" placeholder="GitHub Link" />
  `;
  container.insertBefore(div, container.lastElementChild);
  restoreListeners();
}

function restoreListeners() {
  document.querySelectorAll('input, textarea').forEach(el => {
    el.removeEventListener('input', updatePreview);
    el.addEventListener('input', updatePreview);
  });
}

function clearPreview() {
  preview.innerHTML = '';
  localStorage.removeItem('resumeData');
  updateProgress(); // reset bar
}

function downloadPDF() {
  loader.style.display = "block";

  const resumeHTML = document.getElementById("preview").innerHTML;
  const pdfWrapper = document.getElementById("pdf-preview");

  pdfWrapper.innerHTML = `<div id="pdf-content" style="
    width: 8.27in;
    min-height: 11.69in;
    padding: 1in;
    background: white;
    color: black;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
  ">${resumeHTML}</div>`;

  const opt = {
    margin: 0,
    filename: 'My_Resume.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true
    },
    jsPDF: { unit: 'in', format: [8.27, 11.69], orientation: 'portrait' }
  };

  html2pdf().set(opt).from(document.getElementById("pdf-content")).save().then(() => {
    loader.style.display = "none";
  });
}
