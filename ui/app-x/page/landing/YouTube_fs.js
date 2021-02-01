import React, { useEffect } from 'react'
//const MaterialUI = lib['@material-ui/core']
//const MaterialIcons = lib['@material-ui/icons']
import { Box, Button, Grid, CssBaseline, makeStyles } from '@material-ui/core'
import { Slideshow as SlideshowIcon, MenuBook as MenuBookIcon } from '@material-ui/icons'


export default function Youtube_Landing(props) {

  const useStyles = makeStyles((theme) => ({

    paper: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },

    videoBackground: {
      background: "#555",
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 0
    },
    videoForeground: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      ['@media (min-aspect-ratio: 16/9)']: {
        height: "300%",
        top: "-100%",
      },
      ['@media (max-aspect-ratio: 16/9)']: {
        width: "300%",
        left: "-100%",
      },
    },
  }))

  //console.log(useStyles)
  const styles = useStyles();

  //console.log(styles)
  var player = null;

  const videos = props.youtube_playlist;

  function init_player() {

    let idx = Math.floor(Math.random() * videos.length)
    let video = videos[idx]
    let start = 'start' in video ? video.start : 0
    let end = 'end' in video ? video.end : -1
    // console.log(`INFO: YT start video [${JSON.stringify(video)}]`)

    player = new window.YT.Player('video-foreground', {
      videoId: video.vid, // YouTube Video ID
      playerVars: {
        autoplay: 1,          // Auto-play the video on load
        controls: 0,          // Show pause/play buttons in player
        showinfo: 0,          // Hide the video title
        modestbranding: 1,    // Hide the Youtube Logo
        start: start,
        end: end,
        loop: 1,              // Run the video in a loop
        fs: 0,                // Hide the full screen button
        cc_load_policy: 0,    // Hide closed captions
        iv_load_policy: 3,    // Hide the Video Annotations
        autohide: 0,          // Hide video controls when playing
        //playlist: video.vid,
      },
      events: {
        onReady: function() {
          // console.log(`INFO: YT.player onReady [${video.vid}]`)
          player.mute()
          player.playVideo()
        },
        onStateChange: function(event) {
          if (event.data === 0) { // ended
            let i = Math.floor(Math.random() * videos.length)
            let v = videos[i]
            let s = 'start' in v ? v.start : 0
            let e = 'end' in v ? v.end : -1
            player.cueVideoById({videoId:v.vid, startSeconds:s, endSeconds:e})
            // console.log(`INFO: YT cued video ${JSON.stringify(v)}`)
            player.playVideo()
          }
        },
        onPlaybackQualityChange: function(e) {
          // console.log(`INFO: YT quality ${e.data}`)
        }
      }
    });
  }

  window.onYouTubeIframeAPIReady = () => {
    // console.log(`onYouTubeIframeAPIReady`, window.YT, player)
    init_player()
  }

  useEffect(() => {
      var aScript = document.createElement('script');
      aScript.type = 'text/javascript';
      aScript.id = 'youtube_background';
      aScript.src = 'https://www.youtube.com/iframe_api';

      if (!document.getElementById('youtube_background')) {
        document.head.appendChild(aScript);
        aScript.onload = function() {
          console.log(`INFO: ${aScript.src} loaded`)
          // console.log(window.YT)
          // console.log(player)
        }
      } else {
        // console.log(`INFO: already exist`, window.YT, player)
        init_player()
      }
  }, [])

  // console.log(props)

  return (
    <Box className="paper">
      <Box className={styles.videoBackground}>
        <Box className={styles.videoForeground} id="video-foreground">
        </Box>
      </Box>
      <Box className={styles.paper}>
        { props.children }
      </Box>
    </Box>
  );
}
