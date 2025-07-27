document.addEventListener('DOMContentLoaded', () => {
    const fireAlertButton = document.getElementById('fireAlert');
    const medicalAlertButton = document.getElementById('medicalAlert');
    const naturalDisasterAlertButton = document.getElementById('naturalDisasterAlert');
    const busStopAlertButton = document.getElementById('busStopAlert');
    const requestStopButton = document.getElementById('requestStop');
    const shareLocationButton = document.getElementById('shareLocation');
    const emergencyMessageInput = document.getElementById('emergencyMessageInput');
    const btnSendEmergencyText = document.getElementById('btnSendEmergencyText');
    const emergencyEmailStatus = document.getElementById('emergencyEmailStatus');

    let currentFlashingElement = null;
    let vibrationInterval = null;

    function startFlashing(element) {
        if (currentFlashingElement) {
            currentFlashingElement.classList.remove('flashing');
        }
        element.classList.add('flashing');
        currentFlashingElement = element;
    }

    function stopFlashing() {
        if (currentFlashingElement) {
            currentFlashingElement.classList.remove('flashing');
            currentFlashingElement = null;
        }
    }

    function vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        } else {
            console.log('Vibration API not supported.');
        }
    }

    function startVibrationPattern(pattern, intervalTime) {
        stopVibrationPattern(); // Stop any existing pattern
        vibrate(pattern); // Initial vibration
        vibrationInterval = setInterval(() => {
            vibrate(pattern);
        }, intervalTime);
    }

    function stopVibrationPattern() {
        if (vibrationInterval) {
            clearInterval(vibrationInterval);
            vibrationInterval = null;
        }
        if (navigator.vibrate) {
            navigator.vibrate(0); // Stop any ongoing vibration
        }
    }

    fireAlertButton.addEventListener('click', () => {
        alert('Fire Alert Activated!');
        startFlashing(fireAlertButton);
        startVibrationPattern([200, 100, 200, 100, 200], 600); // Rapid bursts
    });

    medicalAlertButton.addEventListener('click', () => {
        alert('Medical Alert Activated!');
        startFlashing(medicalAlertButton);
        startVibrationPattern([500], 1000); // Steady long pulse
    });

    naturalDisasterAlertButton.addEventListener('click', () => {
        alert('Natural Disaster Alert Activated!');
        startFlashing(naturalDisasterAlertButton);
        startVibrationPattern([1000, 500, 1000], 2500); // Slower pulse
    });

    busStopAlertButton.addEventListener('click', () => {
        alert('Bus Stop Alert Activated!');
        startFlashing(busStopAlertButton);
        startVibrationPattern([100, 50, 100], 300); // Slower pulse for bus stop
    });

    requestStopButton.addEventListener('click', () => {
        alert('Request Stop Signal Sent!');
        stopFlashing();
        stopVibrationPattern();
    });

    btnSendEmergencyText.addEventListener('click', async () => {
      const backendUrl = 'http://192.168.31.2:5000/send-emergency-email'; // change to your actual backend URL
      const emergencyEmailInput = document.getElementById('emergencyEmailInput');

      const message = emergencyMessageInput.value.trim();
      if (!message) {
        alert('請輸入緊急訊息內容。');
        return;
      }

      if (!navigator.geolocation) {
        alert('您的瀏覽器不支援地理位置服務。');
        return;
      }

      emergencyEmailStatus.textContent = '正在取得位置...';

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        const locationUrl = `https://maps.google.com/?q=${lat},${lon}`;

        emergencyEmailStatus.textContent = '正在發送緊急訊息...';

        // *** Replace below with email input or hardcoded recipient ***
        const receiverEmail = emergencyEmailInput ? emergencyEmailInput.value.trim() : 'recipient@example.com';

        try {
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              location: locationUrl,
              email: receiverEmail
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            emergencyEmailStatus.textContent = '緊急訊息已成功發送！';
          } else {
            emergencyEmailStatus.textContent = '發送失敗: ' + (result.error || '未知錯誤');
          }
        } catch (error) {
          emergencyEmailStatus.textContent = '發送失敗: ' + error.message;
        }
      }, () => {
        alert('無法取得位置權限或定位失敗。');
        emergencyEmailStatus.textContent = '';
      }, { enableHighAccuracy: true, timeout: 10000 });

    });

    // Stop flashing and vibration when clicking anywhere else
    document.body.addEventListener('click', (event) => {
        if (!event.target.closest('.alert-button')) {
            stopFlashing();
            stopVibrationPattern();
        }
    });
});