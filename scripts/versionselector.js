const versionSelect = document.getElementById('version-select');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('errorMessage');
const retryButton = document.getElementById('retryButton');
const officialSelector = document.getElementById('official-selector');
const unofficialSelector = document.getElementById('unofficial-selector');
const catsTypeSelector = document.querySelector('.cats-type-selector');
const versionSelector = document.querySelector('.selector');
const backButton = document.getElementById('back-button');

let isOfficial = true;

officialSelector.addEventListener('click', () => {
  isOfficial = true;
  loadVersions();
});

unofficialSelector.addEventListener('click', () => {
  isOfficial = false;
  loadVersions();
});

backButton.addEventListener('click', () => {
  catsTypeSelector.style.display = 'flex';
  versionSelector.style.display = 'none';
  backButton.style.display = 'none';
  resultDiv.style.display = 'none';
});

function loadVersions() {
  catsTypeSelector.style.display = 'none';
  versionSelector.style.display = 'block';
  backButton.style.display = 'inline-block';
  while (versionSelect.firstChild) {
    versionSelect.removeChild(versionSelect.firstChild);
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "Choose a version";
  versionSelect.appendChild(defaultOption);

  loadingDiv.style.display = 'block';

  fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/versions.json')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch versions.json');
      }
    })
    .then(files => {
      files.sort().reverse();

      const promises = files.map(file => {
        return fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/${file}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(`Failed to fetch ${file}`);
            }
          });
      });

      Promise.all(promises)
        .then(dataArray => {
          dataArray.forEach((data, index) => {
            if ((isOfficial && data.official) || (!isOfficial && data.unofficial)) {
              const option = document.createElement('option');
              option.value = files[index];
              option.textContent = data.version;
              versionSelect.appendChild(option);
            }
          });

          loadingDiv.style.display = 'none';
        })
        .catch(error => {
          console.error('Error:', error);
          loadingDiv.style.display = 'none';
          displayErrorMessage('Failed to load version information. Please try again later.');
        });
    })
    .catch(error => {
      console.error('Error:', error);
      loadingDiv.style.display = 'none';
      displayErrorMessage('Failed to load version information. Please try again later.');
    });
}

versionSelect.addEventListener('change', function() {
  const selectedVersion = this.value;
  if (selectedVersion) {
    loadingDiv.style.display = 'block';

    fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/${selectedVersion}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch version JSON file');
        }
      })
      .then(data => {
        loadingDiv.style.display = 'none';
        document.getElementById('version-description').textContent = data.description;
        document.getElementById('latest-version').textContent = data.latestVersion || 'N/A';
        document.getElementById('release-date').textContent = data.releaseDate || 'N/A';
        document.getElementById('eol-date').textContent = data.eolDate || 'N/A';
        const links = {
          'github-link': 'githubLink',
          'download-link': 'downloadLink',
          'wiki-link': 'wikiLink',
          'discord-link': 'discordLink',
          'archive-link': 'archiveLink'
        };
        let hasSupport = false;
        Object.entries(links).forEach(([elementId, dataKey]) => {
          const linkElement = document.getElementById(elementId);
          let linkData;

          if (dataKey === 'archiveLink') {
            linkData = data.archiveLink;
          } else {
            linkData = isOfficial ? data.official?.[dataKey] : data.unofficial?.[dataKey];
          }
          if (linkElement && linkData) {
            linkElement.href = linkData;
            linkElement.style.display = 'inline-block';
            if (dataKey === 'wikiLink' || dataKey === 'discordLink') {
              hasSupport = true;
            }
          } else if (linkElement) {
            linkElement.style.display = 'none';
          }
        });
        const unsupportedMessage = document.getElementById('unsupported-message');
        if (hasSupport) {
          unsupportedMessage.style.display = 'none';
        } else {
          unsupportedMessage.style.display = 'block';
        }
        resultDiv.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
        loadingDiv.style.display = 'none';
        displayErrorMessage('Failed to load version information. Please try again later.');
      });
  } else {
    loadingDiv.style.display = 'none';
    resultDiv.style.display = 'none';
  }
});

function displayErrorMessage(message) {
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
}

retryButton.addEventListener('click', () => {
  location.reload();
});
