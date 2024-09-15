import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { green } from '@mui/material/colors';

function RoomJoinPage() {
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleTextFieldChange = (e) => {
        setRoomCode(e.target.value);
    };

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const handleRoomButtonPressed = () => {
        const csrftoken = getCookie('csrftoken');  // Get the CSRF token

        const requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken  // Include CSRF token in headers with correct name
            },
            body: JSON.stringify({
                code: roomCode
            })
        };

        fetch('/api/join-room', requestOptions).then((response) => {
                if (response.ok) {
                    return response.json();  // Assuming your backend returns the room code
                } else {
                    throw new Error("Room Not Found.");
                }
            })
            .then(() => {
                navigate(`/room/${roomCode}`);
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Join A Room
                </Typography>
            </Grid>

            <Grid item xs={12} align="center">
                <TextField
                    error={Boolean(error)}
                    label="Code"
                    placeholder="Enter a Room Code"
                    value={roomCode}
                    helperText={error}
                    variant="filled" // 'outlined' or 'standard' are also options
                    onChange={handleTextFieldChange}
                />
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRoomButtonPressed}
                    sx={{ backgroundColor: green[500], color: '#fff' }}
                >
                    Enter Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="secondary"
                    component={Link}
                    to='/'
                >
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}

export default RoomJoinPage;
