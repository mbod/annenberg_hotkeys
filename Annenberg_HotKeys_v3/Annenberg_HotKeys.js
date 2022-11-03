
( function() {

    const DEBUG = false;
    const mdiv = document.getElementById("mlist");
    const videoELem = document.getElementById("video");

    const modules = [1,2,3,4,5,6,7,8,9];
    const videos = [...Array(26).keys()].map((i) => String.fromCharCode("a".charCodeAt(0)+i));
    
    let proms=[];
    let videoList=[];
    let videoData = {};

    let currentModuleNum = null;
    

    function switchVideo(vcode) {
        let videoElem = document.getElementById("video");
        const mpath = `modules/${currentModuleNum}/${vcode}.mp4`;
        if (DEBUG) {
            console.log(videoElem);
            console.log(`Switch video to: ${mpath}`);
        }
        videoElem.src = mpath;
    }

    function switchModule(mnum) {

        if (currentModuleNum) {
            document.getElementById(`m${currentModuleNum}`).setAttribute("class", "module");
        }
        currentModuleNum = mnum;
        console.log(currentModuleNum);

        let vnum = videoData[mnum][0];
        if (DEBUG) {
            console.log(`Switched to module ${mnum} starting video ${vnum}.mp4`);
        }
        const cmdiv = document.getElementById(`m${mnum}`);
        cmdiv.setAttribute("class", "module selected");
        
        switchVideo(vnum);
    }


    for (const module of modules) {
        for (const video of videos) {
            const fname = `modules/${module}/${video}.mp4`;
            
            const promise = new Promise(function(resolve, reject) {
                const ielem = document.createElement("video");
                ielem.addEventListener("error", (event) => 
                {
                    if (DEBUG) {
                        console.log(`${fname} ${event.type}`);
                    }
                    resolve("done");
                });
                ielem.addEventListener("loadeddata", (event) => 
                {
                    if (DEBUG) {
                        console.log(`LOADED ${fname} ${event.type}`);
                    }
                    videoList.push(fname);
                    resolve("done");
                })
                ielem.src = fname;

            })
            proms.push(promise);
        }
    }

    Promise.all(proms).then( () =>
        {
            if (DEBUG) {
                console.log("Done checking modules and videos");
            }

            for (const vid of videoList) {
                const vparts = vid.split("/")
                const vlet = vparts[2].charAt(0);
                try {
                    videoData[vparts[1]].push(vlet);
                } catch {
                    videoData[vparts[1]]=[vlet];
                }
            }

            Object.keys(videoData).forEach(function(key) {
                const div = document.createElement("div");
                div.id = `m${key}`;
                div.setAttribute("class", "module");
                const span = document.createElement("span");
                span.classList.add("bold");
                span.innerText = key
                const vspan = document.createElement("span");
                vspan.innerText=videoData[key].sort().join(" ");
                div.appendChild(span);
                div.appendChild(vspan);

                mdiv.append(div);
            }
            )
        }
    )


    
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