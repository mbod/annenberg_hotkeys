(async function () {
    const DEBUG = true;
    const MODULE_AUTOSTART = false;
    const VERSION = "4.1";

    
    const modules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    let videoData = {};
    let folderData = {};
    let currentModuleNum = null;

    // Show version number


    window.addEventListener("load", () => {
	document.getElementById("version-number").innerText = VERSION;
    });


    
    /**
     * Switches the video source based on the folder number.
     * @param {string} fnum - Folder number.
     */
    function switchVideo(fnum) {
        const videoElem = document.getElementById("video");
        const vcode = folderData[currentModuleNum][fnum];


	// hide message dialog
	document.getElementById('message_dialog').style.display="none";
	
	/*
	  TODO: get absolute local path from DirectoryPicker process
	        to allow for modules folder outside of the hotkeys folder
	*/
	//const mpath = `modules/${currentModuleNum}/${fnum}/${vcode}`;
        const mpath = `${vcode}`;
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

	if (!MODULE_AUTOSTART) {
            const videoElem = document.getElementById("video");
	    videoElem.src="";
	    const folderList = Object.keys(folderData[currentModuleNum]).sort().join(', ');
	    const moduleDialog = document.getElementById('message_dialog');
	    document.getElementById('available_folders').innerText = folderList;
	    document.getElementById('folder_message').style.visibility='visible';
	    moduleDialog.style.display="block";
	    return;
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
	    const options = {
		startIn: 'desktop'
	    };
	    
            const directoryHandle = await window.showDirectoryPicker(options);


	    
            await listFiles(directoryHandle, null, null);

            // Sort video data
            Object.keys(videoData).forEach(key => {
                videoData[key].sort();
            });

            if (DEBUG) {
                console.log(videoData);
                console.log(folderData);
            }

	    // clear splash screen and list available modules
	    document.body.style.background = 'none';
            document.getElementById('hotkeys-logo').style.display = 'none';

	    const moduleList = Object.keys(videoData).sort().join(', ');
	    const moduleDialog = document.getElementById('message_dialog');
	    document.getElementById('available_modules').innerText = moduleList;
	    moduleDialog.style.display="block";


	    
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
                if (DEBUG) {
		    console.log(`File ${entry.name}`);
		    const file = await entry.getFile();
		    console.log(file);
		    const fileURL = URL.createObjectURL(file);
		    console.log('PATH?' + fileURL);
		}

                if (!folderData[inModule][letter]) {
                    folderData[inModule][letter] = entry.name;
		    folderData[inModule][letter] = URL.createObjectURL(await entry.getFile());
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

	console.log(videoData.hasOwnProperty(keyVal));
	
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
