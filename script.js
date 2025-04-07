document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startTest');
    const progressFill = document.querySelector('.progress-fill');
    const statusText = document.getElementById('status-text');
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const themeIcon = themeToggle.querySelector('i');

    // Theme handling
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.dataset.theme = savedTheme;
        } else {
            document.body.dataset.theme = prefersDarkScheme.matches ? 'dark' : 'light';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
    }
    
    // Event listeners for theme
    themeToggle.addEventListener('click', toggleTheme);
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.dataset.theme = e.matches ? 'dark' : 'light';
        }
    });
    
    // Initialize theme on load
    initializeTheme();

    function getQualityIndicator(speed, type) {
        let quality = '';
        let text = '';
        
        if (type === 'ping') {
            if (speed <= 50) {
                quality = 'excellent';
                text = 'Super responsive connection';
            } else if (speed <= 100) {
                quality = 'good';
                text = 'Good for gaming and calls';
            } else if (speed <= 200) {
                quality = 'moderate';
                text = 'Decent for browsing';
            } else {
                quality = 'poor';
                text = 'Basic web surfing only';
            }
        } else if (type === 'download') {
            if (speed >= 75) {
                quality = 'excellent';
                text = 'Perfect for 4K streaming';
            } else if (speed >= 40) {
                quality = 'good';
                text = 'Great for HD streaming';
            } else if (speed >= 20) {
                quality = 'moderate';
                text = 'Good for browsing';
            } else {
                quality = 'poor';
                text = 'Basic web surfing only';
            }
        } else if (type === 'upload') {
            if (speed >= 40) {
                quality = 'excellent';
                text = 'Great for video calls';
            } else if (speed >= 20) {
                quality = 'good';
                text = 'Good for sharing files';
            } else if (speed >= 10) {
                quality = 'moderate';
                text = 'Decent for social media';
            } else {
                quality = 'poor';
                text = 'Basic uploads only';
            }
        }
        
        return { quality, text };
    }

    function updateQualityIndicator(speed, type) {
        const qualityEl = document.getElementById(`${type}-quality`);
        const { quality, text } = getQualityIndicator(speed, type);
        
        qualityEl.classList.remove('excellent', 'good', 'moderate', 'poor');
        qualityEl.classList.add(quality);
        qualityEl.textContent = text;
        
        // Reset animation
        qualityEl.style.animation = 'none';
        qualityEl.offsetHeight; // Trigger reflow
        qualityEl.style.animation = 'fadeInUp 0.3s ease forwards';
    }

    const formatSpeed = (speed) => {
        if (speed >= 1000) {
            return (speed / 1000).toFixed(1) + ' Gbps';
        }
        return speed.toFixed(1) + ' Mbps';
    };

    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = start + (end - start) * progress;
            element.textContent = formatSpeed(currentValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const updateProgress = (percent, text) => {
        progressFill.style.width = `${percent}%`;
        statusText.textContent = text;
    };

    const updateUI = (download, upload, pingValue) => {
        // Animate speed values
        const downloadEl = document.getElementById('download-speed');
        const uploadEl = document.getElementById('upload-speed');
        const pingEl = document.getElementById('ping');
        
        const currentDownload = parseFloat(downloadEl.textContent) || 0;
        const currentUpload = parseFloat(uploadEl.textContent) || 0;
        const currentPing = parseFloat(pingEl.textContent) || 0;
        
        animateValue(downloadEl, currentDownload, download, 1000);
        animateValue(uploadEl, currentUpload, upload, 1000);
        
        // Animate ping value
        let startTimestamp = null;
        const animatePing = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / 1000, 1);
            const currentPingValue = currentPing + (pingValue - currentPing) * progress;
            pingEl.textContent = Math.round(currentPingValue) + ' ms';
            if (progress < 1) {
                window.requestAnimationFrame(animatePing);
            }
        };
        window.requestAnimationFrame(animatePing);

        // Update quality indicators with animation
        const downloadQuality = getQualityIndicator('download', download);
        const uploadQuality = getQualityIndicator('upload', upload);
        const pingQuality = getQualityIndicator('ping', pingValue);

        const downloadQualityEl = document.getElementById('download-quality');
        const uploadQualityEl = document.getElementById('upload-quality');
        const pingQualityEl = document.getElementById('ping-quality');

        // Fade out current quality text
        downloadQualityEl.style.opacity = '0';
        uploadQualityEl.style.opacity = '0';
        pingQualityEl.style.opacity = '0';

        // Update and fade in new quality text
        setTimeout(() => {
            downloadQualityEl.textContent = downloadQuality.text;
            downloadQualityEl.className = `quality-indicator ${downloadQuality.class}`;
            downloadQualityEl.style.opacity = '1';
            
            uploadQualityEl.textContent = uploadQuality.text;
            uploadQualityEl.className = `quality-indicator ${uploadQuality.class}`;
            uploadQualityEl.style.opacity = '1';
            
            pingQualityEl.textContent = pingQuality.text;
            pingQualityEl.className = `quality-indicator ${pingQuality.class}`;
            pingQualityEl.style.opacity = '1';
        }, 300);
    };

    const resetUI = () => {
        const elements = [
            document.getElementById('download-speed'),
            document.getElementById('upload-speed'),
            document.getElementById('ping'),
            document.getElementById('download-quality'),
            document.getElementById('upload-quality'),
            document.getElementById('ping-quality')
        ];

        elements.forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = '--';
                if (el.classList.contains('quality-indicator')) {
                    el.className = 'quality-indicator';
                }
                el.style.opacity = '1';
            }, 300);
        });

        updateProgress(0, 'Ready to test');
    };

    function updateSpeedValue(elementId, value, unit) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `${value}<span class="unit">${unit}</span>`;
        }
    }

    async function measurePing() {
        const start = performance.now();
        try {
            await fetch('https://httpbin.org/get', { cache: 'no-store' });
            const end = performance.now();
            const ping = end - start;
            updateSpeedValue('ping', ping.toFixed(0), 'ms');
            return ping;
        } catch (error) {
            console.error('Ping measurement failed:', error);
            throw error;
        }
    }

    async function measureDownloadSpeed() {
        const startTime = performance.now();
        let totalBytes = 0;
        let lastUpdateTime = startTime;
        let lastBytes = 0;

        try {
            const response = await fetch('https://httpbin.org/stream-bytes/1048576', {
                method: 'GET',
                cache: 'no-cache'
            });

            const reader = response.body.getReader();
            const totalSize = 1048576;
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                receivedLength += value.length;
                totalBytes += value.length;
                const currentTime = performance.now();
                
                if (currentTime - lastUpdateTime >= 100) {
                    const speed = ((totalBytes - lastBytes) * 8) / ((currentTime - lastUpdateTime) / 1000) / (1024 * 1024);
                    const progress = 40 + (receivedLength / totalSize) * 30;
                    
                    updateSpeedValue('download-speed', speed.toFixed(2), 'Mbps');
                    document.getElementById('download-speed').classList.add('realtime');
                    updateQualityIndicator(speed, 'download');
                    progressFill.style.width = `${progress}%`;
                    
                    lastUpdateTime = currentTime;
                    lastBytes = totalBytes;
                }
            }

            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const averageSpeed = (totalBytes * 8) / duration / (1024 * 1024);
            
            updateSpeedValue('download-speed', averageSpeed.toFixed(2), 'Mbps');
            document.getElementById('download-speed').classList.remove('realtime');
            updateQualityIndicator(averageSpeed, 'download');
            
            return averageSpeed;
        } catch (error) {
            console.error('Download speed measurement failed:', error);
            throw error;
        }
    }

    async function measureUploadSpeed() {
        const startTime = performance.now();
        const data = new Blob([new ArrayBuffer(524288)]);
        let totalBytes = 0;
        let lastUpdateTime = startTime;
        let lastBytes = 0;
        const timeLimit = 15000; // 15 seconds limit

        try {
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });

            const reader = response.body.getReader();
            const totalSize = 524288;
            let uploadedBytes = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                totalBytes += value.length;
                uploadedBytes += value.length;
                const currentTime = performance.now();
                
                // Check if time limit exceeded
                if (currentTime - startTime > timeLimit) {
                    break;
                }
                
                if (currentTime - lastUpdateTime >= 100) {
                    const speed = ((totalBytes - lastBytes) * 8) / ((currentTime - lastUpdateTime) / 1000) / (1024 * 1024);
                    const progress = 70 + Math.min((uploadedBytes / totalSize) * 30, 30);
                    
                    updateSpeedValue('upload-speed', speed.toFixed(2), 'Mbps');
                    document.getElementById('upload-speed').classList.add('realtime');
                    updateQualityIndicator(speed, 'upload');
                    progressFill.style.width = `${progress}%`;
                    
                    lastUpdateTime = currentTime;
                    lastBytes = totalBytes;
                }
            }

            const endTime = Math.min(performance.now(), startTime + timeLimit);
            const duration = (endTime - startTime) / 1000;
            const averageSpeed = (totalBytes * 8) / duration / (1024 * 1024);
            
            updateSpeedValue('upload-speed', averageSpeed.toFixed(2), 'Mbps');
            document.getElementById('upload-speed').classList.remove('realtime');
            updateQualityIndicator(averageSpeed, 'upload');
            
            return averageSpeed;
        } catch (error) {
            console.error('Upload speed measurement failed:', error);
            throw error;
        }
    }

    async function startTest() {
        // Reset UI
        document.querySelectorAll('.speed-value').forEach(el => {
            el.innerHTML = `--<span class="unit">ms</span>`;
            el.classList.remove('realtime');
        });
        document.querySelectorAll('.quality-indicator').forEach(el => {
            el.textContent = '--';
            el.classList.remove('excellent', 'good', 'moderate', 'poor');
        });
        
        // Start test
        startButton.classList.add('loading');
        startButton.querySelector('span').textContent = 'Testing...';
        startButton.disabled = true;
        
        try {
            // Measure ping
            statusText.textContent = 'Measuring ping...';
            progressFill.style.width = '20%';
            const ping = await measurePing();
            updateSpeedValue('ping', ping.toFixed(0), 'ms');
            updateQualityIndicator(ping, 'ping');
            
            // Measure download speed
            statusText.textContent = 'Measuring download speed...';
            progressFill.style.width = '50%';
            const downloadSpeed = await measureDownloadSpeed();
            updateSpeedValue('download-speed', downloadSpeed.toFixed(2), 'Mbps');
            updateQualityIndicator(downloadSpeed, 'download');
            
            // Measure upload speed
            statusText.textContent = 'Measuring upload speed...';
            progressFill.style.width = '80%';
            const uploadSpeed = await measureUploadSpeed();
            updateSpeedValue('upload-speed', uploadSpeed.toFixed(2), 'Mbps');
            updateQualityIndicator(uploadSpeed, 'upload');
            
            // Complete
            statusText.textContent = 'Test completed!';
            progressFill.style.width = '100%';
            
        } catch (error) {
            console.error('Speed test failed:', error);
            statusText.textContent = 'Test failed. Please try again.';
        } finally {
            // Reset button
            startButton.classList.remove('loading');
            startButton.querySelector('span').textContent = 'Test Again';
            startButton.disabled = false;
        }
    }

    startButton.addEventListener('click', startTest);
}); 
