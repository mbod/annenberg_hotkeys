
( async function() {

    const DEBUG = true;

    const videoELem = document.getElementById("video");

    const modules = [1,2,3,4,5,6,7,8,9];

    

    let videoData = {};
    let folderData = {};

    let currentModuleNum = null;
    

    function switchVideo(fnum) {
        let videoElem = document.getElementById("video");

	const vcode = folderData[fnum];
        const mpath = `modules/${currentModuleNum}/${fnum}/${vcode}`;
        if (DEBUG) {
            console.log(videoElem);
            console.log(`Switch video to: ${mpath}`);
        }
        videoElem.src = mpath;
    }

    function switchModule(mnum) {

        currentModuleNum = mnum;
        console.log(currentModuleNum);

        let fnum = videoData[mnum][0];
	let vnum = folderData[fnum];
        if (DEBUG) {
            console.log(`Switched to module ${mnum} starting video ${vnum}.mp4`);
        }

        switchVideo(fnum);
	
	
    }



    document.getElementById('hotkeys-logo').addEventListener('click', async () => {
	
	try {
            const directoryHandle = await window.showDirectoryPicker();
            const fileListElement = document.getElementById('file-list');
            await listFiles(directoryHandle, null, null);
	    if (DEBUG) {
		console.log(videoData);
		console.log(folderData);
	    }
	    document.getElementById('body').setAttribute('background',null);
	    //document.getElementById('hotkeys-logo').style.visibility='hidden';
    	    document.getElementById('hotkeys-logo').style.display='none';
	} catch (err) {
            console.error('Error accessing directory:', err);
	}
    });


    async function listFiles(directoryHandle, inModule, letter) {
	for await (const entry of directoryHandle.values()) {

	    if (DEBUG) console.log(entry);
	    
            if (entry.kind === 'file' && entry.name.endsWith('.mp4')) {
		if (DEBUG) console.log(`File ${entry.name}`);
		
		if (folderData[letter] === undefined) {
		    folderData[letter] = entry.name;
		}
		
            } else if (entry.kind === 'directory' && inModule) {
		const letterFolder = entry.name;
		videoData[inModule].push(letterFolder)
		await listFiles(entry, inModule, letterFolder);
	    } else if (entry.kind === 'directory' && entry.name in modules) {
		if (DEBUG) console.log(`Directory ${entry.name}`);
		videoData[entry.name]=[];
		const currentModule = entry.name;
		//li.textContent = `Directory: ${entry.name}`;
		//const ul = document.createElement('ul');
		//li.appendChild(ul);
		await listFiles(entry, currentModule, null);
            }
            //fileListElement.appendChild(li);
	}
    }


    
    window.addEventListener('keydown', (event) =>
        {
            const kval = event.key;
            const kcode = event.keyCode;


            console.log(`Keypress: ${kval} (${kcode})`);
            
            // If keypress valid module number
            // switch to that module
            if (videoData.hasOwnProperty(kval) && currentModuleNum != kval) {
                switchModule(kval);
                
            }

            // If keypress is valid video letter for
            // the current module switch to video
            if (videoData[currentModuleNum].indexOf(kval)!=-1) {
                console.log(kval);

                switchVideo(kval);
            }

            // If keypress is space
            if (kcode==32) {
                let videoElem = document.getElementById("video");

                if (videoElem.paused) {
                    videoElem.play();
                } else {
                    videoElem.pause();
                }
            }

            // right or left arrow key
            if ([37,39].includes(kcode)) {
                const direction = kcode==37 ? -1 : 1;
                let videoElem = document.getElementById("video");
                let ctime = videoElem.currentTime;
                let dur = video.duration;
                console.log(ctime);
                ctime = ctime + direction * 10;

                ctime = direction==-1 ? Math.max(0, ctime) : Math.min(ctime, dur);

                console.log(ctime);
                videoElem.currentTime=ctime;
            }

        }
    )


})()
