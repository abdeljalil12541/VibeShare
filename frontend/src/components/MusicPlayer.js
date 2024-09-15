import React, { Component } from "react";
import { Grid, Card, Typography, IconButton, LinearProgress } from "@material-ui/core";
import  PlayArrowIcon from "@material-ui/icons/PlayArrow";
import  PauseIcon from "@material-ui/icons/Pause";
import  SkipNextIcon from "@material-ui/icons/SkipNext";

export default class MusicPlayer extends Component {

    constructor(props) {
        super(props);
        this.pauseSong = this.pauseSong.bind(this);
        this.playSong = this.playSong.bind(this);
        this.SkipSong = this.SkipSong.bind(this);
    }

    pauseSong() {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        };
        fetch('/spotify/pause', requestOptions).then((response) => {
            console.log('song paused')
        });
    }

    playSong() {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        };
        fetch('/spotify/play', requestOptions);
    }

    SkipSong() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        };
        fetch('/spotify/skip', requestOptions).then((response) => {
            console.log('song skipped')
        });
    }

    render() {
        const { image_url, title, artist, is_playing, time, duration, votes, votes_required } = this.props;
        const songProgress = (time && duration) ? (time / duration) * 100 : 0;

        return(
            <Card>
                <Grid container alignItems="center">
                    <Grid item align="center" xs={4}>
                        {image_url && <img src={image_url} alt={title} style={{width: '100%', maxHeight: '150px', objectFit: 'cover'}} />}
                    </Grid>
                    <Grid item align="center" xs={8}>
                        <Typography component="h5" variant="h5">
                            {title || 'No song playing'}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                            {artist || 'Unknown artist'}
                        </Typography>
                        <h6 className="h6 m-0 pt-2">{votes} / {votes_required}</h6>
                        <div>
                            <IconButton onClick={is_playing ? this.pauseSong : this.playSong}>
                                {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={this.SkipSong}>
                                <SkipNextIcon /> 
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>

                <LinearProgress variant="determinate" value={songProgress} />
            </Card>
        )
    }
}