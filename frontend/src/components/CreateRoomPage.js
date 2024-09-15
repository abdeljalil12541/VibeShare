import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { Link, useNavigate } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Collapse, Alert } from "@mui/material";

function CreateRoomPage(props) {
    const defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {},
    };

    const finalProps = { ...defaultProps, ...props };

    const [guestCanPause, setGuestCanPause] = useState(finalProps.guestCanPause);
    const [votesToSkip, setVotesToSkip] = useState(finalProps.votesToSkip);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();

    const handleVotesChange = (e) => {
        setVotesToSkip(e.target.value);
    };

    const handleGuestCanPause = (e) => {
        setGuestCanPause(e.target.value === 'true' ? true : false);
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
        const csrftoken = getCookie('csrftoken');

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause
            }),
        };

        fetch('/api/create-room', requestOptions)
            .then((response) => response.json())
            .then((data) => navigate('/room/' + data.code));  // Use navigate for navigation
    };

    const handleRoomUpdatePressed = () => {
        const csrftoken = getCookie('csrftoken');
        const requestOptions = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
                code: finalProps.roomCode  // Ensure this line is correct
            })
        };
        fetch('/api/update-room', requestOptions)
            .then((response) => {
                if (response.ok) {
                    setSuccessMsg("Room updated successfully!");
                    setErrorMsg("");
                    return response.json();
                } else {
                    setErrorMsg("Error updating room");
                    setSuccessMsg("");
                    throw new Error('Error updating room');
                }
            }).then(() => finalProps.updateCallback());
    }

    const title = finalProps.update ? "Update Room" : "Create a Room";
    const button = finalProps.update ? "Update" : "Create";

    const renderCreateButton = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleRoomButtonPressed}
                    >
                        {button}
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        color="secondary"
                        variant="contained"
                        to="/"
                        component={Link}
                    >
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    };

    const renderUpdateButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleRoomUpdatePressed}
                >
                    Update Room
                </Button>
            </Grid>
        )
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Collapse in={errorMsg !== "" || successMsg !== ""}>
                    {successMsg ? (
                        <Alert 
                            severity="success" 
                            onClose={() => setSuccessMsg("")}
                            sx={{ mb: 2, border: '1px solid green', borderRadius: '10px' }}  // Custom styles
                        >
                            {successMsg}
                        </Alert>
                    ) : (
                        <Alert 
                            severity="error" 
                            onClose={() => setErrorMsg("")}
                            sx={{ mb: 2, border: '1px solid red', borderRadius: '10px' }}  // Custom styles
                        >
                            {errorMsg}
                        </Alert>
                    )}
                </Collapse>
            </Grid>

            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    {title}
                </Typography>
            </Grid>

            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">Guest Control of Playback State</div>
                    </FormHelperText>
                    <RadioGroup
                        row
                        defaultValue={finalProps.guestCanPause.toString()}
                        onChange={handleGuestCanPause}
                    >
                        <FormControlLabel
                            value="true"
                            control={<Radio color="primary" />}
                            label="Play/Pause"
                        />
                        <FormControlLabel
                            value="false"
                            control={<Radio color="secondary" />}
                            label="No Control"
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField
                        required={true}
                        type="number"
                        onChange={handleVotesChange}
                        defaultValue={finalProps.votesToSkip}
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center" },
                        }}
                    />
                    <FormHelperText>
                        <div align="center">Votes Required To Skip Song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>

            {finalProps.update ? renderUpdateButton() : renderCreateButton()}
        </Grid>
    );
}

export default CreateRoomPage;
