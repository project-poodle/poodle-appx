import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  Icon,
  Paper,
  TextField,
  Typography,
  CssBaseline,
  makeStyles
} from '@material-ui/core';
// import ReactPlayer from 'react-player'
import SlideshowIcon from '@material-ui/icons/Slideshow';
import MenuBookIcon from '@material-ui/icons/MenuBook';


const useStyles = makeStyles((theme) => ({

  videoBackground: {
    background: "#000",
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -99
  },
  videoForeground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    ['@media (min-aspect-ratio: 16/9)']: {
      height: "500%",
      top: "-200%",
    },
    ['@media (max-aspect-ratio: 16/9)']: {
      width: "500%",
      left: "-200%",
    },
    zIndex: -98
  },

  control: {
    padding: theme.spacing(2),
  },
  grid: {
    position: "fixed",
    bottom: "8%",
    alignItems: 'center',
  },
  gridTitle: {
    margin: 30,
  },
}))

// keep a list of vids
var videos= [
  {
    vid: 'k5obtOZe4ZQ', // people
    start: 0,
    end: 8,
  },
  {
    vid: 'k5obtOZe4ZQ', // people
    start: 40,
    end: 338,
  },
  {
    vid: 'k5obtOZe4ZQ', // people
    start: 375,
    end: 512,
  },
  {
    vid: 'k5obtOZe4ZQ', // people
    start: 554,
    end: 596,
  },
  {
    vid: '_f43Gl_6hkc', // ocean waves
    start: 0,
    end: -1,
  },
  {
    vid: '-hcXR9aMTxI', // trees
    start: 0,
    end: -1,
  },
  {
    vid: 'wnhvanMdx4s', // space
    start: 0,
    end: 103,
  },
  {
    vid: 'wnhvanMdx4s', // space
    start: 263,
    end: 736,
  },
  //{
  //  vid: 'wnhvanMdx4s', // space
  //  start: 2695,
  //  end: 3001,
  //},
  //{
  //  vid: 'wnhvanMdx4s', // space
  //  start: 4824,
  //  end: 5435,
  //},
  //{
  //  vid: 'wnhvanMdx4s', // space
  //  start: 6752,
  //  end: 6890,
  //},
  {
    vid: 'xRFrjAVH1uQ', // scene
    start: 12,
    end: -1
  },
  {
    vid: 'uGWHSgIzqt0', // forest
    start: 22,
    end: -1,
  },
]


var player = null;

window.onYouTubeIframeAPIReady = () => {

  console.log(`INFO: onYouTubeIframeAPIReady`)
  let idx = Math.floor(Math.random() * videos.length)
  let video = videos[idx]
  let start = 'start' in video ? video.start : 0
  let end = 'end' in video ? video.end : -1
  console.log(`INFO: YT start ${JSON.stringify(video)}`)

  player = new window.YT.Player('video-foreground', {
    videoId: video.vid, // YouTube Video ID
    playerVars: {
      autoplay: 1,        // Auto-play the video on load
      controls: 0,        // Show pause/play buttons in player
      showinfo: 0,        // Hide the video title
      modestbranding: 1,  // Hide the Youtube Logo
      start: start,
      end: end,
      loop: 1,            // Run the video in a loop
      fs: 0,              // Hide the full screen button
      cc_load_policy: 0, // Hide closed captions
      iv_load_policy: 3,  // Hide the Video Annotations
      autohide: 0,         // Hide video controls when playing
      //playlist: video.vid,
    },
    events: {
      onReady: function(e) {
        player.mute()
        player.playVideo()
      },
      onStateChange: function(e) {
        if (e.data == 0) { // ended
          let i = Math.floor(Math.random() * videos.length)
          let v = videos[i]
          let s = 'start' in v ? v.start : 0
          let e = 'end' in v ? v.end : -1
          player.cueVideoById({videoId:v.vid, startSeconds:s, endSeconds:e})
          console.log(`INFO: YT cued ${JSON.stringify(v)}`)
          player.playVideo()
        }
      }
    }
  });
}

export default function Home() {

  const classes = useStyles();

  let idx = Math.floor(Math.random() * videos.length)
  //let video = videos[Math.min(idx, videos.length-1)]
  let video = videos[idx]

  useEffect(() => {
      var aScript = document.createElement('script');
      aScript.type = 'text/javascript';
      aScript.src = "https://www.youtube.com/iframe_api";

      document.head.appendChild(aScript);
      aScript.onload = function() {
        console.log(`INFO: ${aScript.src} loaded`)
        //console.log(window.YT)
      }
  });

  return (
    <Box className={classes.videoBackground}>
      <Box className={classes.videoForeground} id='video-foreground'>
      </Box>
      <CssBaseline />
      <Paper>
      <Grid container component="main" spacing={1} className={classes.grid}>
        <Grid item xs={12} className={classes.gridTitle}>
          <Typography variant="h3" align="center">
            AppX - Design Your Own Apps
          </Typography>
        </Grid>
        <Grid item xs={false} sm={1} md={1} lg={2} xl={3}>
        </Grid>
        <Grid item xs={12} sm={5} md={4} lg={3} xl={2}>
            <Button
              color="primary"
              fullWidth
              startIcon={<MenuBookIcon />}
              //onClick={handleSubmit}
              size="large"
              variant="contained"
            >
              Getting Started
            </Button>
        </Grid>
        <Grid item xs={false} md={1} lg={1} xl={1}>
        </Grid>
        <Grid item xs={false} md={1} lg={1} xl={1}>
        </Grid>
        <Grid item xs={12} sm={5} md={4} lg={3} xl={2}>
            <Button
              color="primary"
              fullWidth
              startIcon={<SlideshowIcon />}
              //onClick={handleSubmit}
              size="large"
              variant="contained"
            >
              Live Demo
            </Button>
        </Grid>
        <Grid item xs={false} sm={1} md={1} lg={2} xl={3}>
        </Grid>
      </Grid>
      </Paper>
    </Box>
  );
}

/*
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

  <ReactPlayer
    width="100%"
    height="100%"
    url={"https://www.youtube.com/watch?v=" + video.vid}
    muted={true}
    config={{
      youtube: {
        playerVars: {
          autoplay: 1,        // Auto-play the video on load
          controls: 0,        // Show pause/play buttons in player
          showinfo: 0,        // Hide the video title
          start: video.start,
          end: video.end,
          modestbranding: 1,  // Hide the Youtube Logo
          enablejsapi: 1,     // allow api control
          loop: 1,            // Run the video in a loop
          fs: 0,              // Hide the full screen button
          cc_load_policy: 0,  // Hide closed captions
          iv_load_policy: 3,  // Hide the Video Annotations
          autohide: 0,        // Hide video controls when playing
          //playlist: shuffle(videos.map(v => v.vid))
        },
        //events: {
        //    onReady: (player) => {
        //    console.log(this)
        //    console.log(player)
        //    this.player.setLoop(true) // Enable playlist looping
        //    this.props.onReady()
        //  },
        //}
      },
    }}
    //onEnded={(reactPlayer) => {
    //  console.log(this)
    //  console.log(reactPlayer)
    //  let player = reactPlayer.player.player
    //  console.log(player)
    //  //let idx = Math.floor(Math.random() * videos.length)
    //  //let video = videos[Math.min(idx, videos.length-1)]
    //  //let video = videos[idx]
    //}}
  />
*/
