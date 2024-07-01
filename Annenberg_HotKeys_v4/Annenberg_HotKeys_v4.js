(async function () {
    const DEBUG = true;
    const modules = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    let videoData = {};
    let folderData = {};
    let currentModuleNum = null;

    /**
     * Switches the video source based on the folder number.
     * @param {string} fnum - Folder number.
     */
    function switchVideo(fnum) {
        const videoElem = document.getElementById("video");
        const vcode = folderData[currentModuleNum][fnum];

	/*
	  TODO: get absolute local path from DirectoryPicker process
	        to allow for modules folder outside of the hotkeys folder
	*/
	const mpath = `modules/${currentModuleNum}/${fnum}/${vcode}`;
        
        if (DEBUG) {
            console.log(videoElem);
            console.log(`Switch video to: ${mpath}`);
        }
        videoElem.src = mpath;
    }

    /**
     * Switches the module based on the module number.
     * @param {string} mnum - Module number.
     */
    function switchModule(mnum) {

	// Check if the module number in mnum is valid
	if (!(mnum in modules)) {
	    console.error(`Invalid module number: ${mnum}`);
	    return;
	}

        currentModuleNum = mnum;

	if (DEBUG) {
	    console.log(currentModuleNum);
	}

        const fnum = videoData[mnum][0];
        const vnum = folderData[mnum][fnum];
        
        if (DEBUG) {
            console.log(`Switched to module ${mnum} starting video ${vnum}.mp4`);
        }
	
        switchVideo(fnum);
    }

    // When user clicks splash logo image bring up directory picker dialog
    // requires access to local file system so needs to be user action
    // initiated
    // TODO: can this be made to work in Firefox? Use of polyfill
    document.getElementById('hotkeys-logo').addEventListener('click', async () => {
        try {
            const directoryHandle = await window.showDirectoryPicker();
            await listFiles(directoryHandle, null, null);

            // Sort video data
            Object.keys(videoData).forEach(key => {
                videoData[key].sort();
            });

            if (DEBUG) {
                console.log(videoData);
                console.log(folderData);
            }

            document.getElementById('body').setAttribute('background', null);
            document.getElementById('hotkeys-logo').style.display = 'none';
        } catch (err) {
            console.error('Error accessing directory:', err);
        }
    });

    /**
     * Recursively lists files and directories.
     * @param {FileSystemDirectoryHandle} directoryHandle - The directory handle.
     * @param {string|null} inModule - The current module.
     * @param {string|null} letter - The current letter folder.
     */
    async function listFiles(directoryHandle, inModule, letter) {
        for await (const entry of directoryHandle.values()) {
            if (DEBUG) console.log(entry);

            if (entry.kind === 'file' && entry.name.endsWith('.mp4')) {
                if (DEBUG) console.log(`File ${entry.name}`);

                if (!folderData[inModule][letter]) {
                    folderData[inModule][letter] = entry.name;
                }
            } else if (entry.kind === 'directory') {
                if (inModule) {
                    const letterFolder = entry.name;
                    videoData[inModule].push(letterFolder);
                    await listFiles(entry, inModule, letterFolder);
                } else if (modules.includes(parseInt(entry.name))) {
                    if (DEBUG) console.log(`Directory ${entry.name}`);
                    const currentModule = entry.name;
                    videoData[currentModule] = [];
                    folderData[currentModule] = {};
                    await listFiles(entry, currentModule, null);
                }
            }
        }
    }

    window.addEventListener('keydown', (event) => {
        const keyVal = event.key;
        const keyCode = event.keyCode;

        console.log(`Keypress: ${keyVal} (${keyCode})`);

        // Switch to a module if a valid module number is pressed
        if (videoData.hasOwnProperty(keyVal) && currentModuleNum != keyVal) {
            switchModule(keyVal);
        }

        // Switch to a video if a valid video letter for the current module is pressed
        if (videoData[currentModuleNum]?.includes(keyVal)) {
            console.log(keyVal);
            switchVideo(keyVal);
        }

        // Play/pause video on spacebar press
        if (keyCode == 32) {
            const videoElem = document.getElementById("video");
            if (videoElem.paused) {
                videoElem.play();
            } else {
                videoElem.pause();
            }
        }

        // Seek video on right/left arrow key press
        if ([37, 39].includes(keyCode)) {
            const direction = keyCode == 37 ? -1 : 1;
            const videoElem = document.getElementById("video");
            let currentTime = videoElem.currentTime;
            const duration = videoElem.duration;

            currentTime = Math.max(0, Math.min(currentTime + direction * 10, duration));
            videoElem.currentTime = currentTime;
        }
    });
})();
