document.addEventListener('DOMContentLoaded', function () {
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const submitButton = document.getElementById('submitButton');
    const form = document.getElementById('json-form');

    agreeCheckbox.addEventListener('change', function () {
        submitButton.disabled = !agreeCheckbox.checked;
    });

    function showWaitingAlert() {
        Swal.fire({
            title: 'Please wait...',
            text: 'Processing your request',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    function showSuccessAlert() {
        Swal.fire({
            title: 'Success!',
            text: 'Your submission was successful.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const jsonData = document.getElementById("json-data").value;
        const adminUID = document.getElementById("inputOfAdmin").value;

        // Check if adminUID or jsonData is missing
        if (!jsonData || !adminUID) {
            Swal.fire({
                title: 'Error',
                text: 'Admin UID and AppState (JSON data) are required!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (agreeCheckbox.checked) {
            showWaitingAlert();

            setTimeout(function () {
                Swal.close();
                showSuccessAlert();
            }, 5000);
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Please agree to the terms and policies.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});

function submitForm(event) {
    event.preventDefault();
    console.log('Form submitted');
}

let Commands = [{
    'commands': []
}, {
    'handleEvent': []
}];

function autoSelectAll() {
    fetch('/commands')
        .then(response => response.json())
        .then(data => {
            const { commands, handleEvent } = data;
            Commands[0].commands = commands;
            Commands[1].handleEvent = handleEvent;
            console.log("Auto-selected commands and events:", Commands);
        })
        .catch(error => console.error('Error fetching commands:', error));
}

document.addEventListener('DOMContentLoaded', autoSelectAll);

function measurePing() {
            const xhr = new XMLHttpRequest();
            let startTime, endTime;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    endTime = Date.now();
                    const pingTime = endTime - startTime;
                    const pingElement = document.getElementById("ping");
                    if (pingElement) {
                        pingElement.textContent = pingTime + " ms";
                    }
                }
            };
            xhr.open("GET", location.href + "?t=" + new Date().getTime());
            startTime = Date.now();
            xhr.send();
        }
        setInterval(measurePing, 1000);

        function updateTime() {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Manila',
                hour12: false,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            };
            const formattedTime = now.toLocaleString('en-US', options);
            const timeElement = document.getElementById('time');
            if (timeElement) {
                timeElement.textContent = formattedTime;
            }
        }
        updateTime();
        setInterval(updateTime, 1000);

async function State() {
    const jsonInput = document.getElementById('json-data');
    const button = document.getElementById('submitButton');
    try {
        button.style.display = 'none';
        const State = JSON.parse(jsonInput.value);
        if (State && typeof State === 'object') {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    state: State,
                    commands: Commands,
                    prefix: document.getElementById('inputOfPrefix').value,
                    admin: document.getElementById('inputOfAdmin').value,
                }),
            });
            const data = await response.json();
            if (data.success) {
                jsonInput.value = '';
                showResult(data.message);
            } else {
                jsonInput.value = '';
                showResult(data.message);
            }
        } else {
            jsonInput.value = '';
            showResult('Invalid JSON data. Please check your input.');
        }
    } catch (parseError) {
        jsonInput.value = '';
        console.error('Error parsing JSON:', parseError);
        showResult('Error parsing JSON. Please check your input.');
    } finally {
        setTimeout(() => {
            button.style.display = 'block';
        }, 4000);
    }
}

function showResult(message) {
    const resultContainer = document.getElementById('result');
    if (resultContainer) {
        resultContainer.innerHTML = `<h5>${message}</h5>`;
        resultContainer.style.display = 'block';
    }
}

function toggleSubmitButton() {
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = !agreeCheckbox.checked;
}

function submitForm(event) {
    event.preventDefault();
    const jsonData = document.getElementById("json-data").value;
    const prefix = document.getElementById("inputOfPrefix").value;
    const adminUID = document.getElementById("inputOfAdmin").value;

    if (!jsonData || !prefix || !adminUID) {
        showResult('All fields are required!');
        return;
    }

    showResult('Your bot is being processed.');
}
async function updateSessionCount() {
    const sessionCountElement = document.getElementById('sessionCount');
    try {
        const response = await fetch("/info");
        const data = await response.json();
        const activeSessions = data.length;

        sessionCountElement.textContent = activeSessions;
  
  } catch (error) {
        console.error('Error fetching session count:', error);
        sessionCountElement.textContent = "Error";
    }
}

updateSessionCount();
setInterval(updateSessionCount, 10000);