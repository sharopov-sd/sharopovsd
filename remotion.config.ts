import {existsSync} from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('swangle');

/**
 * В окружениях, где уже установлен Chromium (например, в контейнере CI),
 * используем его вместо загрузки отдельного Chrome Headless Shell.
 * На обычной машине Remotion скачает свой браузер сам.
 */
const localChromium = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  // chrome-headless-shell — то, что Remotion ожидает по умолчанию
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
].filter(Boolean) as string[];

const found = localChromium.find((p) => existsSync(p));
if (found) {
  Config.setBrowserExecutable(found);
}
