const main = (function () {

    const APIKEY = "qijff1jJSPIFWokHzvfxGh4aTB3wwT6YFi2DLCup";
    const sessionMessage = "Session has been expired. please login again";
    let topImageLoaded = "", bottomImageLoaded = "", spinner = "";

    /** Upon loading the page, we bind handlers to the form,
     * the window and the buttons.*/
    document.addEventListener("DOMContentLoaded", function () {

        let nasaData = nasaDataHandler();
        let serverData = serverDataHandler();
        spinner = document.getElementById("spinner");

        /** Checks if the window scrolled to the bottom.*/
        window.onscroll = function () {
            if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
                nasaData.loadImages();
            }
        };

        document.getElementById('datePicker').valueAsDate = new Date();
        nasaData.getImages();
        document.getElementById("datePicker").addEventListener("change", nasaData.getImages)
        serverData.startTimer();
    });

    const activateLoadGif = () => { spinner.hidden = false; }
    const stopLoadGif = () => { spinner.hidden = true; }

//-----------------------------------------------------------------------
//  A module dealing with all the data we get from nasa server,
//  i.e. the media of the selected date and its data
    const nasaDataHandler = (function () {

        const MAX_IMG = 2;
        const USER_NAME= document.getElementById("currUserName").innerText;
        const EMAIL = document.getElementById("currEmail").innerText;
        let currDate = "";

        /** Handles the date the user choose and give him the data from the 3
         * days before - the date he picked.*/
        const getImages = () => {
            let pickedDate = document.getElementById('datePicker').valueAsDate;
            let endDate = convertDateToString(pickedDate);
            topImageLoaded = pickedDate.toString();
            let startDate = pickedDate;
            startDate.setDate(startDate.getDate() - MAX_IMG);
            bottomImageLoaded = startDate.toString();
            currDate = startDate;
            startDate = convertDateToString(startDate);
            showImages(startDate, endDate, true);
        }

        /** Convert date from date type to string type in the nasa format */
        const convertDateToString = (date) => {
            return date.getFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getDate();
        }

        /** Receives start date ,end date and if this the first 3 pictures and
         sends request for the pictures between the dates
         and adds them to the right element in the html file */
        const showImages = (startDate, endDate, reset) => {
            activateLoadGif();
            fetchImages(startDate, endDate)
                .then(data => handleData(data, reset))
                .catch(error => serverDataHandler().handleErrorCenter(error))
                .finally(() => stopLoadGif());
        }

        /** the fetch request */
        const fetchImages = (startDate, endDate) => {
            let address = "https://api.nasa.gov/planetary/apod?api_key=" + APIKEY + "&start_date=" + startDate + "&end_date=" + endDate;
            return fetch(`${address}`)
                .then(response => {
                    if (!response.ok && response.statusText !== "") {
                        throw Error(response.statusText);
                    }
                    return response.json();
                });
        }

        /** handle the data that we got from the NASA server */
        const handleData = (data, reset) => {
            if(data.code === 400)
                throw Error(data.msg)
            let html = "";
            data.slice().reverse().forEach(function (item) {
                html += handleItem(item);
                serverDataHandler().getData(item.date);
            });
            if (reset)
                document.getElementById("data").innerHTML = html;
            else
                document.getElementById("data").innerHTML =
                    document.getElementById("data").innerHTML + html;
        }


        /** Handles the data of the date that we got from nasa server, creates html
         * element of this data and returns it.*/
        const handleItem = (item) => {

            let title = validator.checkDefined(item.title, "Title");
            let date = validator.checkDefined(item.date, "Date");
            let copyright = validator.checkDefined(item.copyright, "Copyright");
            let url = validator.checkUrl(item.url);
            let explanation = validator.checkExplanation(item.explanation, item.date);
            let commentModal = commentSection(item.date, item.url);

            return `<div class="box"><div class="row px-5 py-1"><div class="col-sm-6 col-md-6 col-lg-1 col-xl-1 text-center"><p><br><br><br>
                   <button type="submit" class="btn btn-outline-light btn-lg" data-bs-toggle="modal" data-bs-target="#comment${item.date}"><i class="fa fa-comment-o"></i></button>${commentModal}</p></div>
                   <div class="col-sm-6 col-md-6 col-lg-3 col-xl-3 text-center">${url}</div><div class="col-sm-12 col-md-12 col-lg-8 col-xl-8"><p>${title}</p><p>${date}</p><p>${explanation}</p><p>${copyright}</p></div></div></p></div>`;
        }

        /** loadImages loads images within a date range using current
         *  and previous day, calls showImages with dates and boolean.*/
        const loadImages = () => {
            currDate.setDate(currDate.getDate() - 1);
            let endDate = convertDateToString(currDate);
            let startDate = currDate;
            startDate.setDate(startDate.getDate() - MAX_IMG);
            startDate = convertDateToString(startDate);
            showImages(startDate, endDate, false);
        }

        /** Gets a date and url of the picture and creates and returns
         * html element with comment section.*/
        const commentSection = (date, url) => {
            let commentId = EMAIL + "-comment-" + date.toString();
            return `<div class="modal fade text-black" id="comment${date}" tabIndex="-1" aria-labelledby="comment${date}Lable"><div class="modal-dialog">
                <div class="modal-content bg-light"><div class="modal-header"><h5 class="modal-title" id="comment${date}Lable"><img src=${url} height=50 width=50 alt=> Date: ${date}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><div class="row">
                <div class="col-10"><textarea class="form-control" id=${commentId} rows="1" maxlength="128" placeholder="Add a comment as ${USER_NAME}..." onkeyup=onClickFunctions.checkEmptyInput("${commentId}")></textarea></div>
                <div class="col-2 fit"><button type="submit" id="${commentId}Btn" class="btn btn-outline-dark" onclick=onClickFunctions.sendData2Post("${date}") disabled>Post</button>
                </div></div><div class="row d-flex justify-content-center" id="commentPerImage${date}" ></div></div>
                <div class="modal-footer"><button type="button" class="btn btn-dark" data-bs-dismiss="modal">Close</button></div></div></div></div>`
        }

        return {
            getImages,
            loadImages,
        }
    })

//-----------------------------------------------------------------------
//  A module dealing with all the data we get from our server
    const serverDataHandler = (function () {

        const USER_NAME = document.getElementById("currUserName").innerText;
        const EMAIL = document.getElementById("currEmail").innerText;
        const ERROR_CENTER = document.getElementById("errorCenter");
        let errorMsg = document.getElementById("errorMessage");

        /** Starts timer that every 15 sec get the changes in the dataBase of
         * the server and updates it in the client side*/
        const startTimer = () => {

            setInterval(function () {
                getChanges();
            }, 15000);
        }

        /** Sends request to the server to get the dates who have been changed
         * after changesTime and gets the updated data about them*/
        const getChanges = () => {
            fetch('/feed/get-changes')
                .then(function (response) {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    if(response.headers.get("session-valid") === "false") {
                        window.location.replace(`/?message=${sessionMessage}`);
                        throw "session expired";
                    }
                    return response.json();
                }).then(function (data) {
                data.forEach(date => {
                    if(imgIsLoaded(date))
                        getData(date);
                });
            })
                .catch(function (error) {
                    handleErrorCenter(error);
                })
        }

        /** Post request. asks from the server to post comment of the wanted picture, with
         our userName and the comment that the user inserted to comments section  */
        const postData = (date) => {
            let commId = EMAIL + "-comment-" + date.toString();
            let tableId = "commentPerImage" + date.toString();
            activateLoadGif();

            const commentData = {
                "comment": document.getElementById(commId).value,
                "date": date.toString()
            }

            /** Sends a comment to server, uses callbacks to handle data,
             *  error, and finally with commentId and date.*/
            sendComment(commentData)
                .then(data => handleData(data, tableId, commId, date))
                .catch(error => handleErrorCenter(error))
                .finally(() => handleFinally(commId, date));
        }

        /** Send the comment to the server, if session is expired, or we got server error
         * then throw error */
        const sendComment = (commentData) => {
            return fetch("/feed/post-comment", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(commentData)
            }).then(response => {
                if (!response.ok)
                    throw Error(response.statusText);
                if(response.headers.get("session-valid") === "false") {
                    window.location.replace(`/?message=${sessionMessage}`);
                    throw "session expired";
                }
                return response.json();
            });
        }

        /**  Updates the HTML table by adding new comment using received data,
         *  comment's value and date.*/
        const handleData = (data, tableId, commId, date) => {
            document.getElementById(tableId).innerHTML += addNewComment(data.id, document.getElementById(commId).value, date);
        }

        /** Clears the input field and disables a button with specific id,
         *  based on the commentId and date passed as arguments.  */
        const handleFinally = (commId, date) => {
            stopLoadGif();
            document.getElementById(commId).value = "";
            document.getElementById(EMAIL + "-comment-" + date.toString() + "Btn").disabled = true;
        }

        /** Creates and returns a new comment element with specified username,
         *  comment text, and a delete button that calls the send2Delete function when clicked. */
        const addNewComment = (id, item, date) => {
            return `<div class="row px-5 py-3"><div class="card bg-white"><div class="card-header bg-white"><i class="fa fa-user-circle my-1 mx-1"></i>
                         <b>${USER_NAME}</b></div><div class="card-body"><p class="card-text">${item}</p><button type="button" class="btn btn-light btn-sm" 
                         id=delete-button onclick=onClickFunctions.send2Delete("${id}","${date.toString()}") >Delete</button></div></div></div>`;
        }

        /** Get request. asks from the server for the data of the wanted date */
        const getData = (date) => {
            let tableId = "commentPerImage" + date.toString();
            activateLoadGif();
            fetch("/feed/get-comments/" + date.toString())
                .then(function (response) {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    if(response.headers.get("session-valid") === "false") {
                        window.location.replace(`/?message=${sessionMessage}`);
                        throw "session expired";
                    }
                    return response.json();
                }).then(function (data) {
                document.getElementById(tableId).innerHTML = creatCommentSection(data, false, date);
            }).catch(function (error) {
                handleErrorCenter(error);
            }).finally(() => stopLoadGif())
        }

        /** Delete request. asks from the server to delete comment of the wanted picture, with
         our userName and the id of the comment and the date of the picture  */
        const deleteComm = (id, date) => {
            activateLoadGif();
            fetch("/feed/delete-comment/" + date + "/" + id, {
                method: "DELETE"
            }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                if(response.headers.get("session-valid") === "false") {
                    window.location.replace(`/?message=${sessionMessage}`);
                    throw "session expired";
                }
                return response;
            }).then(() => {
                getData(date);
            }).catch(function (error) {
                handleErrorCenter(error);
            }).finally(() => stopLoadGif())
        }

        /** creat the comment-section check by the username if delete button needed*/
        const creatCommentSection = (data, dltBtn, date) => {
            let html = ``;
            [...data].forEach(function (item) {
                let deleteBtn = ``;
                if (item.userEmail === document.getElementById("currEmail").innerText)
                    deleteBtn = `<button type="button" class="btn btn-light btn-sm" id=delete-button onclick=onClickFunctions.send2Delete("${item.commentId}","${date.toString()}")>Delete</button>`;

                html += `<div class="row px-5 py-3"><div class="card bg-white"><div class="card-header bg-white"><i class="fa fa-user-circle my-1 mx-1"></i>
                         <b>${item.userName}</b></div><div class="card-body"><p class="card-text">${item.comm}</p>${deleteBtn}</div></div></div>`
            });
            return html;
        }

        /** check if the image with the changes is on the feed*/
        const imgIsLoaded = (dateChanges) =>{
            const date1Time = new Date(dateChanges).getTime();
            const date2Time = new Date(topImageLoaded).getTime();
            const date3Time = new Date(bottomImageLoaded).getTime();
            return date1Time <= date2Time && date3Time <= date1Time;
        }

        /** Displays error message with close button and an exclamation icon,
         *  unhidden error center element on the page, when an error occurs.*/
        const handleErrorCenter = (error) => {
            errorMsg.innerHTML = `<button type="button" class="btn-close mx-2" aria-label="Close" onclick="closeErrorCenter()"></button>
                <i class="fas fa-exclamation-circle fa-lg mx-2" style="--fa-primary-color: red"></i>` + error;
            ERROR_CENTER.hidden = false;
        }

        return{
            getChanges,
            getData,
            postData,
            deleteComm,
            creatCommentSection,
            startTimer,
            handleErrorCenter
        }
    })
//-----------------------------------------------------------------------
//  A validator module dealing with all the data we get from nasa server
    const validator = (function () {

        /**Checks if the url we got is image url, and returns the answer*/
        const isImage = (url) => {
            return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
        }

        /**Checks if the item we got is undefined, and returns the answer*/
        const checkDefined = (item, type) => {
            return (typeof item === 'undefined') ? "<b>" + type + "</b> is undefined" : "<b>" + type + "</b>: " + item;
        }

        /**Checks if the url we got is undefined, returns html element of the url by its type.*/
        const checkUrl = (url) => {
            if (typeof url === 'undefined')
                return "No media to show on this day.";
            if (isImage(url))
                return `<img src="${url}" class="fit" height=220 width=220 alt= >`;
            else
                return `<embed width=220 class="fit" height=220 src="${url}">`;
        }

        /** Checks if the item we got is undefined. if it is, returns string that says it,
         * else, returns html element of the item, depend on its length.*/
        const checkExplanation = (item, date) => {
            if (typeof item === 'undefined')
                return "No explanation to show on this day.";
            if (item.length > 290) {
                return `<p><b>Explanation:</b>${item.substring(0, 290)}<span id="dots${date}">...</span><span id="more${date}" hidden>${item.substring(290)}</span>
                        <button type="button" class="btn btn-link btn-sm" onclick=onClickFunctions.readMore("${date}") id=${date}>more</button></p>`;
            } else return "Explanation: " + item;
        }

        return {
            checkDefined,
            checkUrl,
            checkExplanation,
        }
    })();

    return{
        serverDataHandler
    }
})()

//-----------------------------------------------------------------------
//  A module dealing with all onclick functions
const onClickFunctions = (function () {

    /** Gets id of element and handles the cases when the user wants to
     * see the full explanation on the picture or if he wants to see less of it.*/
    const readMore = (id) => {
        let dots = document.getElementById("dots" + id);
        let moreText = document.getElementById("more" + id);
        let btnText = document.getElementById(id);

        if (!dots.hidden) {
            dots.hidden = true;
            btnText.innerHTML = "less";
            moreText.hidden = false;
        } else {
            dots.hidden = false;
            btnText.innerHTML = "more";
            moreText.hidden = true;
        }
    }

    /** Sends data to the server using a specified date and user.*/
    const sendData2Post = (date) => {
        main.serverDataHandler().postData(date);
    }

    /** Sends a request to the server to delete a comment with specified id and date.*/
    const send2Delete = (id, date) => {
        main.serverDataHandler().deleteComm(id, date);
    }

    /** if input is empty them disable post-comment button else able that button */
    const checkEmptyInput = (commentId) => {
        document.getElementById(commentId + "Btn").disabled = document.getElementById(commentId).value === "";
    }

    return {
        readMore,
        sendData2Post,
        checkEmptyInput,
        send2Delete
    }
})();



