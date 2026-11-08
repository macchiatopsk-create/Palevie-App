#!/usr/bin/env bash
set -euo pipefail
mkdir -p stock output
command -v ffmpeg; command -v ffprobe; command -v curl
cat > output/SOURCES_AND_USAGE.txt <<'EOF'
PALEVIE REAL-FOOTAGE EDITORIAL PROTOTYPES. NOT POSTED.
Six 9-second edits from real commercially usable Pexels footage.
License: https://www.pexels.com/license/
These are STOCK MODELS, not customers or endorsers. No actual PALEVIE product is claimed.
Video is muted: no music rights are assumed. Review on phone before posting.
EOF
ok=0
while IFS='|' read -r id name title direct fallback; do
  [ -n "$id" ] || continue
  src="stock/$id.mp4"
  out="output/$name.mp4"
  echo "::group::Download Pexels source $id"
  if ! curl -fLsS --retry 2 --max-time 180 -A "Mozilla/5.0" "$direct" -o "$src"; then
    echo "HD link failed; try official alternative"
    if ! curl -fLsS --retry 1 --max-time 240 -A "Mozilla/5.0" "$fallback" -o "$src"; then
      echo "::warning::Failed source $id"; rm -f "$src"; echo "::endgroup::"; continue
    fi
  fi
  if ! ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of default=noprint_wrappers=1 "$src"; then
    echo "::warning::Not a valid MP4 $id"; rm -f "$src"; echo "::endgroup::"; continue
  fi
  echo "::endgroup::"
  echo "::group::Render $name"
  vf="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24,setsar=1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='$title':fontcolor=white:fontsize=43:bordercolor=black@0.7:borderw=4:x=(w-text_w)/2:y=210:enable='between(t,0.1,2.5)',format=yuv420p"
  if ffmpeg -hide_banner -loglevel warning -y -ss 0.2 -i "$src" -t 9 -an -vf "$vf" -c:v libx264 -preset veryfast -crf 24 -movflags +faststart "$out"; then
    ffprobe -v error -show_entries stream=width,height -show_entries format=duration,size -of default=noprint_wrappers=1 "$out"
    ffmpeg -hide_banner -loglevel error -y -ss 3 -i "$out" -frames:v 1 -vf scale=270:480 "output/$name.jpg"
    ok=$((ok+1))
  else
    echo "::warning::Failed render $id"
  fi
  echo "$name | https://www.pexels.com/download/video/$id/ | licensed Pexels editorial footage" >> output/SOURCES_AND_USAGE.txt
  echo "::endgroup::"
done <<'EOF'
8997502|01_LIPS_Lipstick_Closeup|LIP COLOR UP CLOSE|https://videos.pexels.com/video-files/8997502/8997502-hd_1920_1080_30fps.mp4|https://www.pexels.com/download/video/8997502/
7987961|02_LIPS_Brush_Application|WATCH THE APPLICATION|https://videos.pexels.com/video-files/7987961/7987961-hd_1920_1080_25fps.mp4|https://www.pexels.com/download/video/7987961/
5068256|03_LIPS_Dramatic_Lip|A BOLD LIP MOMENT|https://videos.pexels.com/video-files/5068256/5068256-hd_1920_1080_25fps.mp4|https://videos.pexels.com/video-files/5068256/5068256-uhd_3840_2160_25fps.mp4
6868400|04_FACE_Cheek_Brush|THE BLUSH MOMENT|https://videos.pexels.com/video-files/6868400/6868400-hd_1080_1920_25fps.mp4|https://www.pexels.com/download/video/6868400/
6944159|05_FACE_Blush_Tutorial|THE FINISHING TOUCH|https://videos.pexels.com/video-files/6944159/6944159-hd_1080_1920_24fps.mp4|https://videos.pexels.com/video-files/6944159/6944159-uhd_2160_3840_24fps.mp4
8998892|06_FACE_Everyday_Finish|REAL MAKEUP IN MOTION|https://videos.pexels.com/video-files/8998892/8998892-hd_1080_1920_25fps.mp4|https://videos.pexels.com/video-files/8998892/8998892-uhd_2160_3840_25fps.mp4
EOF
echo "SUCCESSFUL_REELS=$ok"
if [ "$ok" -eq 0 ]; then exit 1; fi
echo "Rendered $ok/6. Final footage visual inspection is still required." >> output/SOURCES_AND_USAGE.txt
