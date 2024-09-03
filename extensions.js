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
    const videoElement = document.createElement('video')
    const { videoURL, autoplay, controls } = trace.payload

    videoElement.width = 240
    videoElement.src = videoURL

    if (autoplay) {
      videoElement.setAttribute('autoplay', '')
    }
    if (controls) {
      videoElement.setAttribute('controls', '')
    }

    videoElement.addEventListener('ended', function () {
      window.voiceflow.chat.interact({ type: 'complete' })
    })
    element.appendChild(videoElement)
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

    const currentYear = new Date().getFullYear()
    const startYear = 1970
    const endYear = 2024

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    formContainer.innerHTML = `
      <style>
        label {
          font-size: 1em;
          color: #555;
          font-weight: bold;
        }
        .dropdown {
          background: #f7f7f7;
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 5px;
          cursor: pointer;
          margin: 5px 0;
          transition: all 0.3s ease;
          width: 100%;
        }
        .dropdown:hover {
          background: #e74c3c;
          color: white;
        }
        .dropdown-content {
          display: none;
          position: absolute;
          background-color: #f9f9f9;
          min-width: 100%;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
        }
        .dropdown-content div {
          padding: 8px 16px;
          cursor: pointer;
        }
        .dropdown-content div:hover {
          background-color: #f1f1f1;
        }
        .show {
          display: block;
        }
        .submit {
          background: linear-gradient(to right, #e74c3c, #c0392b);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s ease;
        }
        .submit:hover {
          background: linear-gradient(to right, #c0392b, #e74c3c);
        }
      </style>

      <label for="date">Select your date</label><br>
      <div id="day" class="dropdown">Day</div>
      <div id="month" class="dropdown">Month</div>
      <div id="year" class="dropdown">Year</div>

      <div id="day-content" class="dropdown-content">
        ${Array.from({ length: 31 }, (_, i) => `<div>${i + 1}</div>`).join('')}
      </div>
      <div id="month-content" class="dropdown-content">
        ${months.map(month => `<div>${month}</div>`).join('')}
      </div>
      <div id="year-content" class="dropdown-content">
        ${Array.from({ length: endYear - startYear + 1 }, (_, i) => `<div>${endYear - i}</div>`).join('')}
      </div>

      <input type="submit" id="submit" class="submit" value="Submit" disabled="disabled">
    `

    const dayDropdown = formContainer.querySelector('#day')
    const monthDropdown = formContainer.querySelector('#month')
    const yearDropdown = formContainer.querySelector('#year')

    const dayContent = formContainer.querySelector('#day-content')
    const monthContent = formContainer.querySelector('#month-content')
    const yearContent = formContainer.querySelector('#year-content')

    let selectedDay = null
    let selectedMonth = null
    let selectedYear = null

    const submitButton = formContainer.querySelector('#submit')

    function updateSubmitButtonState() {
      if (selectedDay && selectedMonth && selectedYear) {
        submitButton.disabled = false
      } else {
        submitButton.disabled = true
      }
    }

    dayDropdown.addEventListener('click', () => {
      dayContent.classList.toggle('show')
    })
    monthDropdown.addEventListener('click', () => {
      monthContent.classList.toggle('show')
    })
    yearDropdown.addEventListener('click', () => {
      yearContent.classList.toggle('show')
    })

    dayContent.addEventListener('click', event => {
      if (event.target.tagName === 'DIV') {
        selectedDay = event.target.textContent
        dayDropdown.textContent = `Day: ${selectedDay}`
        dayContent.classList.remove('show')
        updateSubmitButtonState()
      }
    })

    monthContent.addEventListener('click', event => {
      if (event.target.tagName === 'DIV') {
        selectedMonth = event.target.textContent
        monthDropdown.textContent = `Month: ${selectedMonth}`
        monthContent.classList.remove('show')
        updateSubmitButtonState()
      }
    })

    yearContent.addEventListener('click', event => {
      if (event.target.tagName === 'DIV') {
        selectedYear = event.target.textContent
        yearDropdown.textContent = `Year: ${selectedYear}`
        yearContent.classList.remove('show')
        updateSubmitButtonState()
      }
    })

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault()

      const date = `${selectedYear}-${months.indexOf(selectedMonth) + 1}-${selectedDay}`
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
    const canvas = document.querySelector('#confetti-canvas')

    var myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    })
    myConfetti({
      particleCount: 200,
      spread: 160,
    })
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
