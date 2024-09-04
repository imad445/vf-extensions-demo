const SVG_Thumb = `<svg width="24px" height="24px" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="currentColor"></path></svg>`

export const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_disableInput' ||
    trace.payload.name === 'ext_disableInput',
  effect: ({ trace }) => {
    const { isDisabled } = trace.payload

    function disableInput() {
      const chatDiv = document.getElementById('voiceflow-chat')

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot
        if (shadowRoot) {
          const chatInput = shadowRoot.querySelector('.vfrc-chat-input')
          const textarea = shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          )
          const button = shadowRoot.querySelector('.vfrc-chat-input--button')

          if (chatInput && textarea && button) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style')
            if (!styleTag) {
              styleTag = document.createElement('style')
              styleTag.id = 'vf-disable-input-style'
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `
              shadowRoot.appendChild(styleTag)
            }

            function updateInputState() {
              textarea.disabled = isDisabled
              if (!isDisabled) {
                textarea.placeholder = 'Message...'
                chatInput.classList.remove('vf-no-border')
                button.classList.remove('vf-hide-button')
                // Restore original value getter/setter
                Object.defineProperty(
                  textarea,
                  'value',
                  originalValueDescriptor
                )
              } else {
                textarea.placeholder = ''
                chatInput.classList.add('vf-no-border')
                button.classList.add('vf-hide-button')
                Object.defineProperty(textarea, 'value', {
                  get: function () {
                    return ''
                  },
                  configurable: true,
                })
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              )
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              )
            }

            // Store original value descriptor
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              'value'
            )

            // Initial update
            updateInputState()
          } else {
            console.error('Chat input, textarea, or button not found')
          }
        } else {
          console.error('Shadow root not found')
        }
      } else {
        console.error('Chat div not found')
      }
    }

    disableInput()
  },
}

export const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_form' || trace.payload.name === 'ext_form',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('div')
    formContainer.className = 'form-wrapper'

    formContainer.innerHTML = `
      <style>
        .form-wrapper {
          font-family: 'Roboto', Arial, sans-serif;
          max-width: 300px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f8f8;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .form-title {
          color: #cc0000;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }
        .input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .input-group input {
          width: 100%;
          padding: 10px;
          border: none;
          border-bottom: 2px solid #ddd;
          background-color: transparent;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }
        .input-group input:focus {
          outline: none;
          border-bottom-color: #cc0000;
        }
        .input-group label {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 16px;
          color: #888;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label {
          top: -20px;
          left: 0;
          font-size: 12px;
          color: #cc0000;
        }
        .submit-btn {
          background-color: #cc0000;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          width: 100%;
        }
        .submit-btn:hover {
          background-color: #990000;
        }
        .error-message {
          color: #cc0000;
          font-size: 12px;
          margin-top: 5px;
          display: none;
        }
      </style>

      <form id="contact-form">
        <div class="form-title">Contact Us</div>

        <div class="input-group">
          <input type="text" id="name" name="name" placeholder=" " required>
          <label for="name">Name</label>
          <div class="error-message" id="name-error"></div>
        </div>

        <div class="input-group">
          <input type="email" id="email" name="email" placeholder=" " required>
          <label for="email">Email</label>
          <div class="error-message" id="email-error"></div>
        </div>

        <div class="input-group">
          <input type="tel" id="phone" name="phone" placeholder=" " required>
          <label for="phone">Phone Number</label>
          <div class="error-message" id="phone-error"></div>
        </div>

        <button type="submit" class="submit-btn">Submit</button>
      </form>
    `

    const form = formContainer.querySelector('#contact-form')
    const inputs = form.querySelectorAll('input')

    const showError = (input, message) => {
      const errorElement = input.parentElement.querySelector('.error-message')
      errorElement.textContent = message
      errorElement.style.display = 'block'
      input.style.borderBottomColor = '#cc0000'
    }

    const hideError = (input) => {
      const errorElement = input.parentElement.querySelector('.error-message')
      errorElement.style.display = 'none'
      input.style.borderBottomColor = ''
    }

    inputs.forEach(input => {
      input.addEventListener('input', () => hideError(input))
    })

    form.addEventListener('submit', function (event) {
      event.preventDefault()

      const name = form.querySelector('#name')
      const email = form.querySelector('#email')
      const phone = form.querySelector('#phone')

      let isValid = true

      if (!name.value.trim()) {
        showError(name, 'Please enter your name')
        isValid = false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showError(email, 'Please enter a valid email address')
        isValid = false
      }

      if (!/^\d{10}$/.test(phone.value)) {
        showError(phone, 'Please enter a valid 10-digit phone number')
        isValid = false
      }

      if (isValid) {
        form.querySelector('.submit-btn').textContent = 'Submitting...'
        form.querySelector('.submit-btn').disabled = true

        // Simulating form submission
        setTimeout(() => {
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: { name: name.value, email: email.value, phone: phone.value },
          })

          form.innerHTML = '<div style="color: #cc0000; text-align: center; font-size: 18px;">Thank you for your submission!</div>'
        }, 1500)
      }
    })

    element.appendChild(formContainer)
  },
}

export const MapExtension = {
  name: 'Maps',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_map' || trace.payload.name === 'ext_map',
  render: ({ trace, element }) => {
    const GoogleMap = document.createElement('iframe')
    const { apiKey, origin, destination, zoom, height, width } = trace.payload

    GoogleMap.width = width || '240'
    GoogleMap.height = height || '240'
    GoogleMap.style.border = '0'
    GoogleMap.loading = 'lazy'
    GoogleMap.allowFullscreen = true
    GoogleMap.src = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&zoom=${zoom}`

    element.appendChild(GoogleMap)
  },
}

export const VideoExtension = {
  name: 'Video',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_video' || trace.payload.name === 'ext_video',
  render: ({ trace, element }) => {
    const iframeElement = document.createElement('iframe');
    const { autoplay, controls } = trace.payload;

    // Specific video ID from the provided URL
    const videoId = 'NVBsfpWsvc0';

    // Construct the YouTube iframe URL with parameters
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (controls) params.set('controls', '1');

    iframeElement.width = '240';
    iframeElement.height = '135'; 
    iframeElement.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    iframeElement.frameBorder = '0';
    iframeElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframeElement.allowFullscreen = true;

    iframeElement.addEventListener('ended', function () {
      window.voiceflow.chat.interact({ type: 'complete' });
    });
    element.appendChild(iframeElement);
  },
}

export const TimerExtension = {
  name: 'Timer',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_timer' || trace.payload.name === 'ext_timer',
  render: ({ trace, element }) => {
    const { duration } = trace.payload || 5
    let timeLeft = duration

    const timerContainer = document.createElement('div')
    timerContainer.innerHTML = `<p>Time left: <span id="time">${timeLeft}</span></p>`

    const countdown = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(countdown)
        window.voiceflow.chat.interact({ type: 'complete' })
      } else {
        timeLeft -= 1
        timerContainer.querySelector('#time').textContent = timeLeft
      }
    }, 1000)

    element.appendChild(timerContainer)
  },
}

export const FileUploadExtension = {
  name: 'FileUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_fileUpload' || trace.payload.name === 'ext_fileUpload',
  render: ({ trace, element }) => {
    const fileUploadContainer = document.createElement('div')
    fileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
      <input type='file' style='display: none;'>
    `

    const fileInput = fileUploadContainer.querySelector('input[type=file]')
    const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload')

    fileUploadBox.addEventListener('click', function () {
      fileInput.click()
    })

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0]
      console.log('File selected:', file)

      fileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`

      var data = new FormData()
      data.append('file', file)

      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error('Upload failed: ' + response.statusText)
          }
        })
        .then((result) => {
          fileUploadContainer.innerHTML =
            '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">'
          console.log('File uploaded:', result.data.url)
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace(
                'https://tmpfiles.org/',
                'https://tmpfiles.org/dl/'
              ),
            },
          })
        })
        .catch((error) => {
          console.error(error)
          fileUploadContainer.innerHTML = '<div>Error during upload</div>'
        })
    })

    element.appendChild(fileUploadContainer)
  },
}

export const KBUploadExtension = {
  name: 'KBUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_KBUpload' || trace.payload.name === 'ext_KBUpload',
  render: ({ trace, element }) => {
    const apiKey = trace.payload.apiKey || null
    const maxChunkSize = trace.payload.maxChunkSize || 1000
    const tags = `tags=${JSON.stringify(trace.payload.tags)}&` || ''
    const overwrite = trace.payload.overwrite || false

    if (apiKey) {
      const kbfileUploadContainer = document.createElement('div')
      kbfileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
      <input type='file' accept='.txt,.text,.pdf,.docx' style='display: none;'>
    `

      const fileInput = kbfileUploadContainer.querySelector('input[type=file]')
      const fileUploadBox =
        kbfileUploadContainer.querySelector('.my-file-upload')

      fileUploadBox.addEventListener('click', function () {
        fileInput.click()
      })

      fileInput.addEventListener('change', function () {
        const file = fileInput.files[0]

        kbfileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`

        const formData = new FormData()
        formData.append('file', file)

        fetch(
          `https://api.voiceflow.com/v3alpha/knowledge-base/docs/upload?${tags}overwrite=${overwrite}&maxChunkSize=${maxChunkSize}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: apiKey,
            },
            body: formData,
          }
        )
          .then((response) => {
            if (response.ok) {
              return response.json()
            } else {
              throw new Error('Upload failed: ' + response.statusText)
              window.voiceflow.chat.interact({
                type: 'error',
                payload: {
                  id: 0,
                },
              })
            }
          })
          .then((result) => {
            kbfileUploadContainer.innerHTML =
              '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">'
            window.voiceflow.chat.interact({
              type: 'complete',
              payload: {
                id: result.data.documentID || 0,
              },
            })
          })
          .catch((error) => {
            console.error(error)
            kbfileUploadContainer.innerHTML = '<div>Error during upload</div>'
          })
      })
      element.appendChild(kbfileUploadContainer)
    }
  },
}

export const DateExtension = {
  name: 'Date',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_date' || trace.payload.name === 'ext_date',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form')

    // Get current date
    let currentDate = new Date()
    let minDate = new Date()
    minDate.setMonth(currentDate.getMonth() - 1)
    let maxDate = new Date()
    maxDate.setMonth(currentDate.getMonth() + 2)

    // Convert to ISO string and remove time part
    let minDateString = minDate.toISOString().slice(0, 10)
    let maxDateString = maxDate.toISOString().slice(0, 10)

    formContainer.innerHTML = `
          <style>
            label {
              font-size: 0.8em;
              color: #888;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
                border: none;
                background: transparent;
                border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
                bottom: 0;
                outline: none;
                color: transparent;
                cursor: pointer;
                height: auto;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                width: auto;
                padding:6px;
                font: normal 8px sans-serif;
            }
            .meeting input{
              background: transparent;
              border: none;
              padding: 2px;
              border-bottom: 0.5px solid rgba(255, 0, 0, 0.5); /* Red color */
              font: normal 14px sans-serif;
              outline:none;
              margin: 5px 0;
              &:focus{outline:none;}
            }
            .invalid {
              border-color: red;
            }
            .submit {
              background: linear-gradient(to right, #e12e2e, #f12e2e ); /* Red gradient */
              border: none;
              color: white;
              padding: 10px;
              border-radius: 5px;
              width: 100%;
              cursor: pointer;
              opacity: 0.3;
            }
            .submit:enabled {
              opacity: 1; /* Make the button fully opaque when it's enabled */
            }
          </style>
          <label for="date">Select your date</label><br>
          <div class="meeting"><input type="date" id="meeting" name="meeting" value="" min="${minDateString}" max="${maxDateString}" /></div><br>
          <input type="submit" id="submit" class="submit" value="Submit" disabled="disabled">
          `

    const submitButton = formContainer.querySelector('#submit')
    const dateInput = formContainer.querySelector('#meeting')

    dateInput.addEventListener('input', function () {
      if (this.value) {
        submitButton.disabled = false
      } else {
        submitButton.disabled = true
      }
    })
    formContainer.addEventListener('submit', function (event) {
      event.preventDefault()

      const date = dateInput.value
      console.log(date)

      formContainer.querySelector('.submit').remove()

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { date: date },
      })
    })
    element.appendChild(formContainer)
  },
}

export const ConfettiExtension = {
  name: 'Confetti',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_confetti' || trace.payload.name === 'ext_confetti',
  effect: ({ trace }) => {
    const canvas = document.querySelector('#confetti-canvas');

    // Create red heart emojis as custom shapes
    for (let i = 0; i < 100; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = '❤️';
      emoji.style.position = 'absolute';
      emoji.style.fontSize = '24px';
      emoji.style.animation = `fall 1.5s ease-in-out ${i * 0.05}s forwards`;
      emoji.style.opacity = '0'; // Start invisible
      emoji.style.transform = 'scale(0.8)';
      emoji.style.transition = 'opacity 0.3s, transform 0.3s';
      document.body.appendChild(emoji);

      const x = Math.random() * window.innerWidth;
      const y = -50; // Start above the viewport
      emoji.style.left = `${x}px`;
      emoji.style.top = `${y}px`;

      // Trigger the smooth appearance and fall
      setTimeout(() => {
        emoji.style.opacity = '1';
        emoji.style.transform = 'scale(1)';
      }, 50);
    }

    // Custom falling animation
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
      @keyframes fall {
        0% { transform: translateY(-50px); opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
    `, styleSheet.cssRules.length);

    // Remove emojis after animation ends
    setTimeout(() => {
      const emojis = document.querySelectorAll('div[style*="❤️"]');
      emojis.forEach(emoji => emoji.remove());
    }, 2000); // 1.5 seconds for the animation + 0.5 second buffer
  },
}

export const FeedbackExtension = {
  name: 'Feedback',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_feedback' || trace.payload.name === 'ext_feedback',
  render: ({ trace, element }) => {
    const feedbackContainer = document.createElement('div')

    feedbackContainer.innerHTML = `
          <style>
            .vfrc-feedback {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .vfrc-feedback--description {
                font-size: 0.8em;
                color: grey;
                pointer-events: none;
            }

            .vfrc-feedback--buttons {
                display: flex;
            }

            .vfrc-feedback--button {
                margin: 0;
                padding: 0;
                margin-left: 0px;
                border: none;
                background: none;
                opacity: 0.2;
            }

            .vfrc-feedback--button:hover {
              opacity: 0.5; /* opacity on hover */
            }

            .vfrc-feedback--button.selected {
              opacity: 0.6;
            }

            .vfrc-feedback--button.disabled {
                pointer-events: none;
            }

            .vfrc-feedback--button:first-child svg {
                fill: none; /* color for thumb up */
                stroke: none;
                border: none;
                margin-left: 6px;
            }

            .vfrc-feedback--button:last-child svg {
                margin-left: 4px;
                fill: none; /* color for thumb down */
                stroke: none;
                border: none;
                transform: rotate(180deg);
            }
          </style>
          <div class="vfrc-feedback">
            <div class="vfrc-feedback--description">Was this helpful?</div>
            <div class="vfrc-feedback--buttons">
              <button class="vfrc-feedback--button" data-feedback="1">${SVG_Thumb}</button>
              <button class="vfrc-feedback--button" data-feedback="0">${SVG_Thumb}</button>
            </div>
          </div>
        `

    feedbackContainer
      .querySelectorAll('.vfrc-feedback--button')
      .forEach((button) => {
        button.addEventListener('click', function (event) {
          const feedback = this.getAttribute('data-feedback')
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: { feedback: feedback },
          })

          feedbackContainer
            .querySelectorAll('.vfrc-feedback--button')
            .forEach((btn) => {
              btn.classList.add('disabled')
              if (btn === this) {
                btn.classList.add('selected')
              }
            })
        })
      })

    element.appendChild(feedbackContainer)
  },
}

export const DinosaurGameExtension = {
  name: 'DinosaurGame',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_dinosaur_game' || trace.payload.name === 'ext_dinosaur_game',
  render: ({ trace, element }) => {
    const gameContainer = document.createElement('div')
    gameContainer.className = 'dinosaur-game-wrapper'

    gameContainer.innerHTML = `
      <style>
        .dinosaur-game-wrapper {
          font-family: 'Fredoka One', cursive;
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background-color: #16d9e3;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .game-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-gap: 10px;
        }
        .card {
          width: 100%;
          height: 100px;
          background-color: wheat;
          border-radius: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 40px;
          color: #93794c;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .card.flipped {
          transform: rotateY(180deg);
          background-color: #fff8e7;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .card.matched {
          pointer-events: none;
        }
        .game-over {
          text-align: center;
          margin-top: 20px;
          font-size: 20px;
          color: #ffffff;
        }
        .reset-btn {
          background-color: #fbc300;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: 10px;
        }
        .reset-btn:hover {
          background-color: #f2a003;
        }
      </style>

      <div class="game-title">Dinosaur Memory Game</div>
      <div class="board"></div>
      <div class="game-over"></div>
    `

    const board = gameContainer.querySelector('.board')
    const gameOver = gameContainer.querySelector('.game-over')
    
    const dinosaurs = ['🥚', '🦖', '🦕', '🦴', '🦴', '🦕', '🦖', '🥚']
    let flippedCards = []
    let matchedPairs = 0

    function createCard(dinosaur, index) {
      const card = document.createElement('div')
      card.className = 'card'
      card.textContent = '?'
      card.dataset.index = index
      card.addEventListener('click', flipCard)
      return card
    }

    function flipCard() {
      if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped')
        this.textContent = dinosaurs[this.dataset.index]
        flippedCards.push(this)

        if (flippedCards.length === 2) {
          setTimeout(checkMatch, 500)
        }
      }
    }

    function checkMatch() {
      const [card1, card2] = flippedCards
      if (card1.textContent === card2.textContent) {
        card1.classList.add('matched')
        card2.classList.add('matched')
        matchedPairs++

        if (matchedPairs === dinosaurs.length / 2) {
          gameOver.textContent = 'Congratulations! You won!'
          const resetBtn = document.createElement('button')
          resetBtn.textContent = 'Play Again'
          resetBtn.className = 'reset-btn'
          resetBtn.addEventListener('click', resetGame)
          gameOver.appendChild(resetBtn)
        }
      } else {
        card1.classList.remove('flipped')
        card2.classList.remove('flipped')
        card1.textContent = '?'
        card2.textContent = '?'
      }
      flippedCards = []
    }

    function resetGame() {
      board.innerHTML = ''
      gameOver.innerHTML = ''
      matchedPairs = 0
      flippedCards = []
      shuffleArray(dinosaurs)
      initializeBoard()
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
    }

    function initializeBoard() {
      shuffleArray(dinosaurs)
      dinosaurs.forEach((dinosaur, index) => {
        const card = createCard(dinosaur, index)
        board.appendChild(card)
      })
    }

    initializeBoard()
    element.appendChild(gameContainer)
  },
}

export const SeatSelectorExtension = {
  name: 'SeatSelector',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_seatselector' ||
    trace.payload.name === 'ext_seatselector',
  render: ({ trace, element }) => {
    const { numberOfSeats = 0 } = trace.payload
    const seatSelectorContainer = document.createElement('div')

    seatSelectorContainer.innerHTML = `
      <style>
        .seat-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .row {
          display: flex;
          gap: 10px;
        }
        .aisle {
          width: 20px;
        }
        .seat {
          width: 30px;
          height: 30px;
          border: 0.3px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          border-radius: 5px;
          font-weight: bold;
        }
        .seat.selected {
          background-color: #2e6ee1;
          color: white;
        }
        .seat.occupied {
          background-color: #ccc;
          cursor: not-allowed;
          font-weight: normal;
        }
        .submit {
          background: linear-gradient(to right, #2e6ee1, #2e7ff1);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
        }
        .submit:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      </style>
      <div class="seat-selector">
        ${generateSeats()}
      </div>
      <button class="submit" disabled>Confirm Seat Selection</button>
    `

    function generateSeats() {
      const rows = 10
      const seatsPerRow = 6
      let seatsHTML = ''
      for (let i = 0; i < rows; i++) {
        seatsHTML += '<div class="row">'
        for (let j = 0; j < seatsPerRow; j++) {
          if (j === 3) seatsHTML += '<div class="aisle"></div>'
          const seatNumber = `${i + 1}${String.fromCharCode(65 + j)}`
          const isOccupied = Math.random() < 0.3 // 30% chance of being occupied
          seatsHTML += `<div class="seat ${
            isOccupied ? 'occupied' : ''
          }" data-seat="${seatNumber}">${seatNumber}</div>`
        }
        seatsHTML += '</div>'
      }
      return seatsHTML
    }

    let selectedSeats = []
    const submitButton = seatSelectorContainer.querySelector('.submit')
    let isSubmitted = false

    function updateSubmitButton() {
      submitButton.disabled =
        selectedSeats.length !== numberOfSeats || isSubmitted
    }

    seatSelectorContainer.addEventListener('click', function (event) {
      if (
        !isSubmitted &&
        event.target.classList.contains('seat') &&
        !event.target.classList.contains('occupied')
      ) {
        if (event.target.classList.contains('selected')) {
          event.target.classList.remove('selected')
          selectedSeats = selectedSeats.filter(
            (seat) => seat !== event.target.dataset.seat
          )
        } else if (selectedSeats.length < numberOfSeats) {
          event.target.classList.add('selected')
          selectedSeats.push(event.target.dataset.seat)
        }
        updateSubmitButton()
      }
    })

    submitButton.addEventListener('click', function () {
      if (!isSubmitted) {
        isSubmitted = true
        updateSubmitButton()
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { selectedSeats: selectedSeats },
        })
      }
    })

    updateSubmitButton()
    element.appendChild(seatSelectorContainer)
  },
}

export const SeatSelectorv2Extension = {
  name: 'SeatSelectorv2',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_seatselectorv2' ||
    trace.payload.name === 'ext_seatselectorv2',
  render: ({ trace, element }) => {
    const { numberOfSeats = 1, reservedSeats = [] } = trace.payload
    const seatSelectorContainer = document.createElement('div')
    console.log('Reserved seats:', reservedSeats)

    // Fetch and inject CSS
    fetch('https://cdn.jsdelivr.net/npm/seatchart@0.1.0/dist/seatchart.css')
      .then((response) => response.text())
      .then((css) => {
        const style = document.createElement('style')
        style.textContent = css
        seatSelectorContainer.appendChild(style)
      })

    // Create and append script
    const script = document.createElement('script')
    script.src =
      'https://cdn.jsdelivr.net/npm/seatchart@0.1.0/dist/seatchart.min.js'
    script.type = 'text/javascript'
    document.body.appendChild(script)

    seatSelectorContainer.innerHTML = `
     <style>

      .vfrc-message--extension-SeatSelectorv2 {
        background-color: transparent !important;
        background: none !important;
      }

      #container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin: 0;
        padding: 0;
        width: 275px;
        height: 600px;
        max-width: none;
        transform: scale(0.63);
        transform-origin: top left;
        overflow: visible;
        overflowX: hidden;
        overflowY: hidden;
      }

      .economy {
        color: white;
        background-color: #43aa8b;
      }

      .business {
        color: white;
        background-color: #277da1;
      }

      .premium {
        color: white;
        background-color: #f8961e;
      }

      .sc-seat {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 42px;
        width: 42px;
        margin: 4px;
        box-sizing: border-box;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        user-select: none;
        transition: all 0.1s ease-in-out;
      }

      .sc-seat.sc-seat-available:hover {
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      }

      .sc-seat.sc-seat-selected {
        cursor: pointer;
        background-color: black !important;
        color: white !important;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
      }

      .sc-seat.sc-seat-reserved,
      .sc-seat-reserved {
        color: white;
        background-color: #d2d2d2;
        cursor: not-allowed;
      }

      #buttonContainer {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        transition: opacity 0.3s ease;
      }

      #submitButton, #cancelButton {
        font-size: 16px;
        border: none;
        color: white;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
      }

      #submitButton {
        flex: 3;
        background: linear-gradient(to right, #2e6ee1, #2e7ff1);
      }

      #submitButton:hover:not(:disabled) {
        background: linear-gradient(to right, #2558b3, #2669c9);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      #cancelButton {
        flex: 1;
        background: linear-gradient(to right, #ff9999, #ff9999);
      }

      #cancelButton:hover:not(:disabled) {
        background: #ff8080;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      #submitButton:disabled, #cancelButton:disabled {
        background: #ccc;
        cursor: not-allowed;
        color: #666;
        box-shadow: none;
      }

    </style>
    <div id="container"></div>
    <div id="buttonContainer">
      <button id="submitButton">Confirm seat selection</button>
      <button id="cancelButton">Cancel</button>
    </div>`

    // Function to generate random reserved seats
    function generateRandomReservedSeats(totalRows, totalColumns, count) {
      const reservedSeats = []
      const totalSeats = totalRows * totalColumns
      const occupancyRate = 0.3 // 30% of seats will be reserved

      const numberOfReservedSeats = Math.floor(totalSeats * occupancyRate)

      while (reservedSeats.length < numberOfReservedSeats) {
        const row = Math.floor(Math.random() * totalRows)
        const col = Math.floor(Math.random() * totalColumns)
        const seat = { row, col }

        // Check if this seat is already reserved
        if (!reservedSeats.some((s) => s.row === row && s.col === col)) {
          reservedSeats.push(seat)
        }
      }

      return reservedSeats
    }

    // Function to translate reserved seats from seat labels to row and column indices
    function translateReservedSeats(seatLabels) {
      return seatLabels.map((label) => {
        const row = label.charCodeAt(0) - 65
        const col = parseInt(label.slice(1)) - 1
        return { row, col }
      })
    }

    var options = {
      cart: {
        visible: false,
      },
      legendVisible: false,
      map: {
        frontVisible: false,
        indexerColumns: {
          visible: false,
        },
        indexerRows: {
          visible: false,
        },
        rows: 15,
        columns: 7,
        seatTypes: {
          default: {
            label: 'Economy',
            cssClass: 'economy',
            price: 560,
            seatRows: [4, 5, 6, 8, 9, 10, 11, 13, 14],
          },
          first: {
            label: 'Business',
            cssClass: 'business',
            price: 2500,
            seatRows: [0, 1, 2],
          },
          premium: {
            label: 'Premuim',
            cssClass: 'premium',
            price: 680,
            seatColumns: [0, 6],
          },
        },
        disabledSeats: [
          { row: 0, col: 0 },
          { row: 0, col: 6 },
          { row: 14, col: 0 },
          { row: 14, col: 6 },
        ],
        // reservedSeats: translateReservedSeats(reservedSeats),
        reservedSeats: generateRandomReservedSeats(15, 7),
        /* reservedSeats: [
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
        selectedSeats: [{ row: 0, col: 5 }, { row: 0, col: 6 }],*/
        rowSpacers: [3, 7, 12],
        columnSpacers: [2, 5],
      },
    }

    // Wait for both CSS and JS to load before initializing Seatchart
    Promise.all([
      new Promise((resolve) => (script.onload = resolve)),
      fetch(
        'https://cdn.jsdelivr.net/npm/seatchart@0.1.0/dist/seatchart.css'
      ).then((res) => res.text()),
    ]).then(([_, css]) => {
      const style = document.createElement('style')
      style.textContent = css
      seatSelectorContainer.appendChild(style)

      var sc = new Seatchart(
        seatSelectorContainer.querySelector('#container'),
        options
      )

      const submitButton = seatSelectorContainer.querySelector('#submitButton')
      submitButton.disabled = true // Disable button by default
      const cancelButton = seatSelectorContainer.querySelector('#cancelButton')

      let isSubmitted = false

      // Function to update button state and text
      const updateButtonState = () => {
        const selectedSeats = sc.getCart()
        submitButton.disabled =
          selectedSeats.length !== numberOfSeats || isSubmitted
        const buttonContainer =
          seatSelectorContainer.querySelector('#buttonContainer')

        if (isSubmitted) {
          buttonContainer.style.opacity = '0'
          buttonContainer.style.pointerEvents = 'none'
        } else {
          buttonContainer.style.opacity = '1'
          buttonContainer.style.pointerEvents = 'auto'

          if (numberOfSeats === 1) {
            submitButton.textContent = 'Confirm seat selection'
          } else {
            const remainingSeats = numberOfSeats - selectedSeats.length
            if (remainingSeats > 0) {
              submitButton.textContent = `Select ${remainingSeats} more seat${
                remainingSeats !== 1 ? 's' : ''
              }`
            } else {
              submitButton.textContent = 'Confirm seats selection'
            }
          }
        }
      }

      // Add event listener for seat changes
      sc.addEventListener('seatchange', (event) => {
        // console.log('Seat change event:', event)
        updateButtonState()
      })

      // Initial button state update
      updateButtonState()

      // Create a mapping for seat type labels
      const seatTypeLabels = {
        default: 'Economy',
        first: 'Business',
        premium: 'Premium',
      }

      cancelButton.addEventListener('click', function () {
        if (isSubmitted) return

        isSubmitted = true
        updateButtonState()

        // Disable selector and buttons
        seatSelectorContainer.querySelector('#container').style.pointerEvents =
          'none'
        seatSelectorContainer.querySelector('#container').style.opacity = '0.7'

        window.voiceflow.chat.interact({ type: 'canceled' })
      })

      submitButton.addEventListener('click', function () {
        submitButton.textContent = ''
        if (isSubmitted) return

        isSubmitted = true
        updateButtonState()

        var selectedSeats = sc.getCart()
        var total = selectedSeats.reduce((sum, seat) => {
          var seatType = options.map.seatTypes[seat.type]
          return sum + seatType.price
        }, 0)

        // Function to get seat label from Seatchart
        const getSeatLabel = (row, col) => {
          const seatInfo = sc.getSeat({ row, col })
          return seatInfo.label || `${row + 1}${String.fromCharCode(65 + col)}`
        }

        // Function to get the correct seat type label
        const getSeatTypeLabel = (type) => {
          return seatTypeLabels[type] || type
        }

        // Prepare payload
        const payload = {
          selectedSeats: selectedSeats.map((seat) => ({
            label: getSeatLabel(seat.index.row, seat.index.col),
            type: getSeatTypeLabel(seat.type),
            price: options.map.seatTypes[seat.type].price,
          })),
          totalPrice: total,
        }

        // Submit to interact
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: payload,
        })

        // Disable selector and button
        isSubmitted = true
        updateButtonState()

        // Disable the container
        seatSelectorContainer.querySelector('#container').style.pointerEvents =
          'none'
        seatSelectorContainer.querySelector('#container').style.opacity = '0.7'

        console.log('Submitted seats:', payload)
      })
    })
    element.appendChild(seatSelectorContainer)
  },
}