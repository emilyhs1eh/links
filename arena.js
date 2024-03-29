// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script')
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js'
document.head.appendChild(markdownIt)



// Okay, Are.na stuff!
let channelSlug = 'wave-ripple-water' 


// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (data) => {
	// Target some elements in your HTML:
	let channelTitle = document.getElementById('channel-title')
	let channelDescription = document.getElementById('channel-description')
	let channelCount = document.getElementById('channel-count')
	let channelLink = document.getElementById('channel-link') 

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = data.title
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description) // Converts Markdown → HTML
	//channelCount.innerHTML = data.length
	//channelLink.href = `https://www.are.na/channel/${channelSlug}`
}


// Then our big function for specific-block-type rendering:
let renderBlock = (block) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.getElementById('channel-blocks')
	console.log (block.class)



// Links!
if (block.class == 'Link') {
    let linkItem =
        `
        <div class="block block--link">
            <picture>
                <source media="(max-width: 428px)" srcset="${block.image.thumb.url}">
                <source media="(max-width: 640px)" srcset="${block.image.large.url}">
                <img src="${block.image.original.url}" alt="${block.title}">
            </picture>
            <h3>${block.title}</h3>
            <p><a href="${block.source.url}">See the original ↗</a></p>
        </div>
        `
        ;
    channelBlocks.insertAdjacentHTML('beforeend', linkItem);
}

// Images!
else if (block.class == 'Image') {
    let ImageItem =
        `
        <div class="block block--image">
            <figure>
                <img src="${block.image.large.url}" alt="${block.title} by ${block.author}">
                <figcaption>${block.title}</figcaption>
            </figure>
        </div>
        `;
    channelBlocks.insertAdjacentHTML('beforeend', ImageItem);
}

// Text!
else if (block.class == 'Text') {
    let textItem =
        `
        <div class="block block--text">
            <blockquote>${block.content_html}</blockquote>
        </div>
        `;
    channelBlocks.insertAdjacentHTML('beforeend', textItem);
}

// Uploaded (not linked) media…
else if (block.class == 'Attachment') {
    let attachment = block.attachment.content_type; // Save us some repetition

    // Uploaded videos!
    if (attachment.includes('video')) {
        let videoItem =
            `
            <div class="block block--video">
                <p><em>Video</em></p>
                <video controls src="${block.attachment.url}"></video>
            </div>
            `;
        channelBlocks.insertAdjacentHTML('beforeend', videoItem);
    }

// Uploaded PDFs!
else if (attachment.includes('pdf')) {
    let pdfItem =
        `
        <div class="block block--pdf">
            <figure>
                <a href="${block.attachment.url}" alt="${block.title}">
                    <img src="${block.image.large.url}" alt="${block.title}">
                    <figcaption>${block.title}</figcaption>
                    <p><a href="${block.source.url}">See the original pdf↗</a></p>
                </a>
            </figure>
        </div>
        `;
    channelBlocks.insertAdjacentHTML('beforeend', pdfItem);
}

// Uploaded audio!
else if (attachment.includes('audio')) {
        let audioItem =
            `
            <div class="block block--audio">
                <p><em>Audio</em></p>
                <audio controls src="${block.attachment.url}"></audio>
                <figcaption>${block.title}</figcaption>
            </div>
            `;
        channelBlocks.insertAdjacentHTML('beforeend', audioItem);
    }
}

// Linked media…
else if (block.class == 'Media') {
    let embed = block.embed.type;

    // Linked video!
    if (embed.includes('video')) {
        let linkedVideoItem =
            `
            <div class="block block--video">
                <p><em>Linked Video</em></p>
                ${block.embed.html}
            </div>
            `;
        channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem);
    }

// Linked audio!
else if (embed.includes('rich')) {
        let linkedAudioItem =
            `
            <div class="block block--audio">
                <p><em>Linked Audio</em></p>
                ${block.embed.html}
            </div>
            `;
        channelBlocks.insertAdjacentHTML('beforeend', linkedAudioItem);
    }
}
}



// It‘s always good to credit your work:

let renderUser = (user, container) => {
    let userAddress = `
        <address>
            <img src="${user.avatar_image.display}">
            <h3>${user.first_name}</h3>
            <p><a href="https://are.na/${user.slug}" target="_blank">Are.na profile ↗</a></p>
        </address>
    `;
    container.insertAdjacentHTML('beforeend', userAddress);
};



// Now that we have said what we can do, go get the data:
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`,{ cache: 'no-store' })
	.then((response) => response.json()) // Return it as JSON data
	.then((data) => { // Do stuff with the data
		console.log(data) // Always good to check your response!
		placeChannelInfo(data) // Pass the data to the first function

		// Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
		data.contents.reverse().forEach((block) => {
			// console.log(block) // The data for a single block
			renderBlock(block) // Pass the single block data to the render function
		})

		// Also display the owner and collaborators:
		let channelUsers = document.getElementById('channel-users') // Show them together
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers))
		renderUser(data.user, channelUsers)
	})



 