document.addEventListener('DOMContentLoaded', function () {
    // Initialize Materialize components
    M.AutoInit();

    // Function to fetch server URL
    async function getServerUrl() {
        try {
            const url = 'https://raw.githubusercontent.com/awdev1/24client/main/backend';
            const cacheBuster = `?cb=${new Date().getTime()}`;
            const response = await fetch(url + cacheBuster);
            if (!response.ok) {
                throw new Error('Network response was not okay');
            }
            const serverUrl = await response.text();
            return serverUrl.trim(); // Trim any extra whitespace
        } catch (error) {
            console.error('Failed to fetch server URL:', error);
            return null; // Handle the case where URL couldn't be fetched
        }
    }

    // Fetch server URL
    (async function() {
        const serverUrl = await getServerUrl();
        if (!serverUrl) {
            console.error('Server URL could not be fetched.');
            return;
        }

        const loginContainer = document.getElementById('loginContainer');
        const signupContainer = document.getElementById('signupContainer');
        const appContent = document.getElementById('appContent');

        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const flightForm = document.getElementById('flightForm');
        const chatForm = document.getElementById('chatForm');
        const addFriendForm = document.getElementById('addFriendForm');

        const themeToggle = document.getElementById('themeToggle');
        const departureInput = document.getElementById('departure');
        const destinationInput = document.getElementById('destination');
        const messageInput = document.getElementById('message');
        const friendUsernameInput = document.getElementById('friendUsername');

        const flightInfoDiv = document.getElementById('flightInfo');
        const messagesDiv = document.getElementById('messages');
        const friendsListDiv = document.getElementById('friendsList');
        const friendsFlightsDiv = document.getElementById('friendsFlights');

        let currentUsername = '';

        const fetchUpdates = async () => {
            if (!currentUsername) return;

            try {
                // Fetch recent messages
                const messagesResponse = await fetch(`${serverUrl}/api/messages`);
                const messagesData = await messagesResponse.json();
                messagesDiv.innerHTML = '<h6>Messages</h6>' + messagesData.map(msg => `<p>${msg.username}: ${msg.message}</p>`).join('');

                // Fetch flights
                const flightsResponse = await fetch(`${serverUrl}/api/flights/${currentUsername}`);
                const flightsData = await flightsResponse.json();
                flightInfoDiv.innerHTML = '<h6>Flight Info</h6>' + flightsData.map(flight => `<p>${flight.departure} to ${flight.destination}</p>`).join('');

                // Fetch friends
                const friendsResponse = await fetch(`${serverUrl}/api/friends/${currentUsername}`);
                const friendsData = await friendsResponse.json();
                friendsListDiv.innerHTML = '<h6>Your Friends</h6>' + friendsData.friends.map(friend => `<p>${friend}</p>`).join('');

                // Fetch friends' flights
                const friendsFlightsResponse = await fetch(`${serverUrl}/api/flights/${currentUsername}`);
                const friendsFlightsData = await friendsFlightsResponse.json();
                friendsFlightsDiv.innerHTML = '<h6>Friends\' Flights</h6>' + friendsFlightsData.map(flight => `<p>${flight.departure} to ${flight.destination}</p>`).join('');
            } catch (error) {
                console.error('Error fetching updates:', error);
            }
        };

        // Fetch updates every 5 seconds
        fetchUpdates(); // Initial fetch
        setInterval(fetchUpdates, 5000);

        // Login Form Submission
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            try {
                const response = await fetch(`${serverUrl}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (result.success) {
                    currentUsername = username;
                    loginContainer.style.display = 'none';
                    appContent.style.display = 'block';
                    fetchUpdates(); // Refresh data after login
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        });

        // Signup Form Submission
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;
            try {
                const response = await fetch(`${serverUrl}/api/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (result.success) {
                    signupContainer.style.display = 'none';
                    loginContainer.style.display = 'block';
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Signup error:', error);
            }
        });

        // Flight Form Submission
        flightForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const departure = departureInput.value;
            const destination = destinationInput.value;
            try {
                const response = await fetch(`${serverUrl}/api/flights`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUsername, departure, destination })
                });
                const result = await response.json();
                if (response.ok) {
                    departureInput.value = '';
                    destinationInput.value = '';
                    fetchUpdates(); // Refresh data
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Flight submission error:', error);
            }
        });

        // Chat Form Submission
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value;
            try {
                const response = await fetch(`${serverUrl}/api/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUsername, message })
                });
                const result = await response.json();
                if (response.ok) {
                    messageInput.value = '';
                    fetchUpdates(); // Refresh messages
                } else {
                    Swal.fire('Error', result.error, 'error');
                }
            } catch (error) {
                console.error('Chat submission error:', error);
            }
        });

        // Add Friend Form Submission
        addFriendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const friendUsername = friendUsernameInput.value;
            try {
                const response = await fetch(`${serverUrl}/api/friends`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUsername, friendUsername })
                });
                const result = await response.json();
                if (response.ok) {
                    friendUsernameInput.value = '';
                    fetchUpdates(); // Refresh friends list
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Add friend error:', error);
            }
        });

        // Clear Flights
        document.getElementById('clearFlights').addEventListener('click', async () => {
            try {
                const response = await fetch(`${serverUrl}/api/flights`, { method: 'DELETE' });
                const result = await response.json();
                if (response.ok) {
                    fetchUpdates(); // Refresh flights
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Clear flights error:', error);
            }
        });

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            document.body.classList.toggle('light-theme');
        });
    })();
});
