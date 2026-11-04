import {Config} from '@remotion/cli/config';

// PNG intermediate frames keep the 3D gradients / glows clean (JPEG shows banding).
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setConcurrency(2); // 4 workers OOM at 1080p with the 3D scenes
// This machine's headless Chrome needs ANGLE for WebGL (Metal). `swiftshader` fails on macOS.
Config.setChromiumOpenGlRenderer('angle');
