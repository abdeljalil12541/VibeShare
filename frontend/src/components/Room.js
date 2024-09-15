import React, { Component, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

// Wrapper function to use hooks with class components
function withRouter(Component) {
    return props => {
        const navigate = useNavigate();
        return <Component {...props} navigate={navigate} />;
    }
}

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {}
        };
        this.roomCode = this.props.roomCode;  // Now roomCode is passed as a prop
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.getRoomDetails();
    }


    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode).then((response) => 
            {
                if(!response.ok){
                    this.props.leaveRoomCallback();
                    this.props.navigate('/');
                }

                return response.json();
            }
    ).then((data) => {
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host,
            });
            if (this.state.isHost) {
                this.authenticateSpotify();
            }
        });
    }

    getCookie(name) {
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
    }

    authenticateSpotify() {
        fetch('/spotify/is-authenticated')
            .then((response) => response.json())
            .then((data) => {
                this.setState({ spotifyAuthenticated: data.status });
                if(!data.status) {
                    fetch('/spotify/get-auth-url')
                        .then((response) => response.json())
                        .then((data) => {
                            window.location.replace(data.url)
                        });
                }
            });
    }


    componentDidMount() {
        this.interval = setInterval(() => this.getCurrentSong(), 1000); // Update every 5 seconds
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getCurrentSong() {
        fetch('/spotify/current-song')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                this.setState({ song: data });
                console.log('Current song:', data);
            })
            .catch((error) => {
                console.error('Error fetching current song:', error);
                this.setState({ song: {} });  // Set to empty object instead of null
            });
    }

    leaveButtonPressed() {
        const csrftoken = this.getCookie('csrftoken');
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            }
        };
        fetch('/api/leave-room', requestOptions)
            .then((_response) => {
                if (this.props.leaveRoomCallback) {
                    this.props.leaveRoomCallback();
                }
                this.props.navigate('/');
            })
            .catch((error) => {
                console.error("Error leaving room:", error);
                this.props.navigate('/');
            });
    }

    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        })
    }

    renderSettingsButton() {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
                <FontAwesomeIcon icon={faCog} style={{ marginRight: '8px' }} />
                    Settings
                </Button>
            </Grid>
        )
    }

    renderSettings() {
        return (<Grid container spacing={1}>
                    <Grid item xs={12} align="center">
                        <CreateRoomPage 
                            update={true}
                            votesToSkip={this.state.votesToSkip}
                            guestCanPause={this.state.guestCanPause}
                            roomCode={this.roomCode}
                            updateCallback={this.getRoomDetails}
                            />
                    </Grid>
                    <Grid item xs={12} align="center">
                        <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.updateShowSettings(false)}
                        >
                            Close
                        </Button>
                    </Grid>
                </Grid>)
    }

    render() {
        if (this.state.showSettings) {
            return this.renderSettings()
        }else{

        }

        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <MusicPlayer 
                        image_url={this.state.song.image_url}
                        title={this.state.song.title}
                        artist={this.state.song.artist}
                        is_playing={this.state.song.is_playing}
                        time={this.state.song.time}
                        duration={this.state.song.duration}
                        votes={this.state.song.votes}
                        votes_required={this.state.song.votes_required}
                    />
                </Grid>
                {this.state.isHost ? this.renderSettingsButton() : null}
                <Grid item xs={12} align="center">
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={this.leaveButtonPressed}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
                        Leave Room
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(Room);
