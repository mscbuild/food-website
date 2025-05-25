// Search functionality
const searchInput = document.querySelector('.search-input');
const searchSubmitBtn = document.querySelector('[data-search-submit-btn]');
const searchContainer = document.querySelector('[data-search-container]');

console.log('Search elements:', { searchInput, searchSubmitBtn, searchContainer });

// Function to escape special characters in regex
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to highlight text
function highlightText(text, query) {
	if (!query) return text;
	const escapedQuery = escapeRegExp(query);
	const regex = new RegExp(`(${escapedQuery})`, 'gi');
	return text.replace(regex, '<mark>$1</mark>');
}

// Function to scroll to element smoothly
function scrollToElement(element) {
	if (!element) return;

	const headerOffset = 100;
	const elementPosition = element.getBoundingClientRect().top;
	const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

	window.scrollTo({
		top: offsetPosition,
		behavior: 'smooth'
	});
}

// Function to show search feedback
function showSearchFeedback(count) {
	let feedback = document.querySelector('.search-feedback');
	if (!feedback) {
		feedback = document.createElement('div');
		feedback.className = 'search-feedback';
		searchContainer.appendChild(feedback);
	}

	if (count === 0) {
		feedback.textContent = 'No matches found';
		feedback.style.color = '#ff4444';
	} else {
		feedback.textContent = `Found ${count} matches`;
		feedback.style.color = '#4CAF50';
	}

	// Remove feedback after 3 seconds
	setTimeout(() => {
		feedback.remove();
	}, 3000);
}

// Function to perform search
function performSearch(query) {
	if (!query || query.trim() === '') {
		showSearchFeedback(0);
		return;
	}

	query = query.trim();

	// First, remove any existing highlights
	const existingMarks = document.getElementsByTagName('mark');
	while (existingMarks.length > 0) {
		const parent = existingMarks[0].parentNode;
		parent.replaceChild(document.createTextNode(existingMarks[0].textContent), existingMarks[0]);
	}

	// Get all text nodes in the document
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: function (node) {
				// Skip script, style, and mark tags
				if (node.parentNode.nodeName === 'SCRIPT' ||
					node.parentNode.nodeName === 'STYLE' ||
					node.parentNode.nodeName === 'MARK' ||
					node.parentNode.nodeName === 'NOSCRIPT' ||
					node.parentNode.nodeName === 'IFRAME') {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		},
		false
	);

	let node;
	let matchCount = 0;
	let firstMatch = null;

	while (node = walker.nextNode()) {
		const text = node.textContent;
		if (text.toLowerCase().includes(query.toLowerCase())) {
			const span = document.createElement('span');
			span.className = 'search-result';
			span.innerHTML = highlightText(text, query);
			node.parentNode.replaceChild(span, node);

			if (!firstMatch) {
				firstMatch = span;
			}
			matchCount++;
		}
	}

	// Show feedback
	showSearchFeedback(matchCount);

	// Scroll to first match if found
	if (firstMatch) {
		scrollToElement(firstMatch);
	}
}

// Event listeners
searchSubmitBtn.addEventListener('click', (e) => {
	console.log('Search button clicked');
	e.preventDefault();
	performSearch(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		console.log('Enter pressed in search input');
		e.preventDefault();
		performSearch(searchInput.value);
	}
});

// Clear search results when closing search
document.querySelector('[data-search-close-btn]').addEventListener('click', () => {
	console.log('Search close button clicked');
	// Remove all highlights
	const marks = document.getElementsByTagName('mark');
	console.log('Removing highlights:', marks.length);
	while (marks.length > 0) {
		const parent = marks[0].parentNode;
		parent.replaceChild(document.createTextNode(marks[0].textContent), marks[0]);
	}

	// Remove feedback if exists
	const feedback = document.querySelector('.search-feedback');
	if (feedback) {
		feedback.remove();
	}

	// Clear search input
	searchInput.value = '';
}); 