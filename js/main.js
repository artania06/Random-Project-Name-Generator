// Wait for the page load before launching the main script
window.addEventListener('load', () => {
  /**
   * Return a random value from an array
   * @param {Array} array The array to pick the value from
   * @returns {*} The randomly picked value
   */
  function randomValueFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Hide an HTML element
   * @param {Node} node The HTML element to hide
   */
  function hide(node) {
    // eslint-disable-next-line no-param-reassign
    node.style.display = 'none';
  }

  /**
   * Show an HTML element
   * @param {Node} node The HTML element to show
   */
  function show(node) {
    // eslint-disable-next-line no-param-reassign
    node.style.display = 'block';
  }

  /**
   * Return the string trimmed with ellipsis if the string is longer than maxLength
   * @param {String} str The string to trim
   * @param {Number} maxLength The maximum length of the string
   * @returns {String} The trimmed string
   */
  function trimString(str, maxLength) {
    if (str.length > maxLength) {
      return `${str.substring(0, maxLength - 3)}...`;
    }
    return str;
  }

  // The presets to load
  const presetsURLs = [
    './presets/elegant_penguin.json',
    './presets/visionary_palm_tree.json',
  ];
  // The array of loaded presets
  let presets = [];

  // The current preset and project name
  let currentPreset = null;
  let projectName = '';

  // Related to loading animation
  let loading = false;
  const loaderUnit = (Math.PI * 2) / 765;
  const TWO_PI = Math.PI * 2;
  const FOUR_PI = Math.PI * 4;
  let animationStep = 0;

  // Setup the draw zone and hide the preset selector while loading presets
  const canvas = document.querySelector('#main');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const presetSelector = document.querySelector('#presetSelector');
  hide(presetSelector);

  /**
   * Draw the loading animation
   * @param {Number} step the current animation step
   */
  function drawLoader(step) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    const fontRatio = 0.011111;
    const size = fontRatio * canvas.width;
    ctx.font = `${size}px Arial`;
    ctx.fillText('Loading', 0, size / 3);

    // One full rotation every 60 steps (approx. 1 second)
    ctx.rotate((step * Math.PI) / 30);
    ctx.lineWidth = 10;
    for (let i = 0; i < 255; i += 1) {
      ctx.beginPath();
      ctx.strokeStyle = `rgb(${255 - i},${i},${0})`;
      ctx.arc(0, 0, 50, loaderUnit * i, loaderUnit * i + loaderUnit, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = `rgb(${0},${255 - i},${i})`;
      ctx.arc(0, 0, 50, TWO_PI / 3 + loaderUnit * i,
        TWO_PI / 3 + loaderUnit * i + loaderUnit, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = `rgb(${i},${0},${255 - i})`;
      ctx.arc(0, 0, 50, FOUR_PI / 3 + loaderUnit * i,
        FOUR_PI / 3 + loaderUnit * i + loaderUnit, false);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  }

  /**
   * Draw the "Generate another" button
   */
  function drawButton() {
    ctx.save();
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    const width = 0.138889 * canvas.width;
    const height = 0.096852 * canvas.height;
    const x = -width / 2;
    const y = height;
    const radius = 0.013889 * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const fontRatio = 0.015278;
    ctx.font = `${fontRatio * canvas.width}px Arial`;
    ctx.fillText('Generate another', 0, y + height / 2 + 8);
  }

  /**
   * Draw the project name
   */
  function drawProjectName() {
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    const fontRatio = 0.022222;
    const size = fontRatio * canvas.width;
    ctx.font = `${size}px Arial`;
    ctx.fillText(projectName, 0, -size / 3);
  }

  /**
   * Main animation loop
   */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (loading) {
      drawLoader(animationStep);
    } else {
      drawProjectName();
      drawButton();
    }
    ctx.restore();

    animationStep += 1;
    requestAnimationFrame(animate);
  }

  animate();

  /**
   * Load the presets from the presetsURLs
   * @returns {Promise} A promise that is resolved with an array of presets once they are loaded
   */
  function loadPresets() {
    return new Promise((resolve) => {
      const params = {
        method: 'GET',
      };

      const tempPresets = [];
      for (let i = 0; i < presetsURLs.length; i += 1) {
        fetch(presetsURLs[i], params).then((response) => {
          response.text().then((data) => {
            const parsed = JSON.parse(data);
            tempPresets.push(parsed);

            if (tempPresets.length === presetsURLs.length) {
              resolve(tempPresets);
            }
          });
        });
      }
    });
  }

  /**
   * Update the project name with randomly picked values from the current preset
   */
  function getRandomProjectName() {
    let tempName = '';

    tempName += trimString(randomValueFromArray(currentPreset.wordlist1), 40);
    tempName += ' ';
    tempName += trimString(randomValueFromArray(currentPreset.wordlist2), 40);

    projectName = trimString(tempName);
  }

  // Update the current preset everytime the user chooses a new preset
  presetSelector.addEventListener('change', (event) => {
    const choosed = event.target.value;
    currentPreset = presets[choosed];
    getRandomProjectName();
  });

  // Generate a new project name everytime the user clicks on the "generate another" button
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const xPos = (event.clientX - rect.left) / canvas.width;
    const yPos = (event.clientY - rect.top) / canvas.height;

    // The program must not be loading and the click must be within the button range
    if (!loading && xPos > 0.43125 && xPos < 0.571528 && yPos > 0.60109 && yPos < 0.700363) {
      getRandomProjectName();
    }
  });

  // Load the presets and get a first project name
  loading = true;
  loadPresets().then((loadedPresets) => {
    loading = false;
    presets = loadedPresets;

    // Setup the preset selector with the loaded presets
    presetSelector.innerHTML = '';
    for (let i = 0; i < presets.length; i += 1) {
      const optionNode = document.createElement('option');
      optionNode.innerText = trimString(`${presets[i].name} by ${presets[i].author}`, 50);
      optionNode.value = i;
      presetSelector.appendChild(optionNode);
    }
    show(presetSelector);

    [currentPreset] = presets;
    getRandomProjectName();
  });
});
