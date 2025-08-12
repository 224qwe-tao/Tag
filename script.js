document.addEventListener('DOMContentLoaded', () => {
    const isPage1 = window.location.pathname.includes('page1');
    const pageId = isPage1 ? 'page1_' : 'page2_';
    const tagInput = document.getElementById('tag');
    const numberSelect = document.getElementById('number');
    const targetSelect = document.getElementById('target-list');
    const option1 = document.getElementById('option1');
    const option2 = document.getElementById('option2');
    const option3 = document.getElementById('option3');
    const option4 = document.getElementById('option4');
    const listsContainer = document.getElementById('lists-container');
    const resultTextarea = document.getElementById('result');
    const setButton = document.getElementById('set');
    const addButton = document.getElementById('add');
    const combineButton = document.getElementById('combine');
    const copyButton = document.getElementById('copy');
    const saveButton = document.getElementById('save');
    const downloadButton = document.getElementById('download');
    const resetButton = document.getElementById('reset');
    const nai45Button = document.getElementById('nai45');
    const nai30Button = document.getElementById('nai30');
    const weightSelect = document.getElementById('weight');
    const customWeight = document.getElementById('custom-weight');

    let listsCount = parseInt(localStorage.getItem(pageId + 'listsCount')) || 1;

    if (weightSelect) {
        weightSelect.addEventListener('change', () => {
            if (weightSelect.value === 'custom') {
                customWeight.style.display = 'inline-block';
            } else {
                customWeight.style.display = 'none';
            }
        });
    }

    function createListSection(num) {
        const div = document.createElement('div');
        div.className = 'list-section';
        const header = document.createElement('div');
        header.className = 'list-header';
        const label = document.createElement('label');
        label.htmlFor = 'list' + num;
        label.textContent = 'List ' + num + ':';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', () => {
            if (listsCount > 1) {
                deleteList(num);
            }
        });
        header.appendChild(label);
        header.appendChild(deleteBtn);
        const textarea = document.createElement('textarea');
        textarea.id = 'list' + num;
        textarea.rows = 10;
        textarea.placeholder = 'Edited tags will appear here';
        div.appendChild(header);
        div.appendChild(textarea);
        return div;
    }

    function addList(num) {
        const listDiv = createListSection(num);
        listsContainer.appendChild(listDiv);
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        targetSelect.appendChild(option);
    }

    function deleteList(targetNum) {
        let contents = [];
        for (let i = 1; i <= listsCount; i++) {
            if (i !== targetNum) {
                contents.push(document.getElementById('list' + i).value);
            }
        }
        let currentTarget = parseInt(targetSelect.value);
        listsCount--;
        listsContainer.innerHTML = '';
        targetSelect.innerHTML = '';
        for (let i = 1; i <= listsCount; i++) {
            addList(i);
            document.getElementById('list' + i).value = contents[i - 1];
        }
        let newTarget = currentTarget;
        if (targetNum < currentTarget) {
            newTarget--;
        } else if (targetNum === currentTarget) {
            newTarget = 1;
        }
        targetSelect.value = newTarget.toString();
    }

    // Load saved data
    const savedTag = localStorage.getItem(pageId + 'tag');
    const savedNumber = localStorage.getItem(pageId + 'number');
    const savedOption1 = localStorage.getItem(pageId + 'option1') === 'true';
    const savedOption2 = localStorage.getItem(pageId + 'option2') === 'true';
    const savedOption3 = localStorage.getItem(pageId + 'option3') === 'true';
    const savedOption4 = localStorage.getItem(pageId + 'option4') === 'true';
    const savedTarget = localStorage.getItem(pageId + 'target') || '1';

    if (savedTag) tagInput.value = savedTag;
    if (savedNumber) numberSelect.value = savedNumber;
    option1.checked = savedOption1;
    option2.checked = savedOption2;
    option3.checked = savedOption3;
    option4.checked = savedOption4;

    if (isPage1 && weightSelect) {
        const savedWeight = localStorage.getItem(pageId + 'weight');
        if (savedWeight) weightSelect.value = savedWeight;
        if (savedWeight === 'custom') {
            customWeight.value = localStorage.getItem(pageId + 'customWeight') || '';
            customWeight.style.display = 'inline-block';
        }
    }

    for (let i = 1; i <= listsCount; i++) {
        addList(i);
        const textarea = document.getElementById('list' + i);
        textarea.value = localStorage.getItem(pageId + 'list' + i) || '';
    }
    targetSelect.value = savedTarget;

    setButton.addEventListener('click', () => {
        const tag = tagInput.value.trim();
        if (!tag) {
            alert('Please enter a tag.');
            return;
        }

        const n = parseInt(numberSelect.value);
        let text = tag;

        // Apply wrappings from inner to outer: option3 then [] then {}
        if (option3.checked) {
            if (isPage1) {
                let weightVal;
                if (weightSelect.value === 'custom') {
                    weightVal = customWeight.value.trim();
                    if (!weightVal || isNaN(parseFloat(weightVal))) {
                        alert('Please enter a valid custom weight.');
                        return;
                    }
                } else {
                    weightVal = weightSelect.value;
                }
                text = weightVal + '::' + text + '::';
            } else {
                text = '('.repeat(n) + text + ')'.repeat(n);
            }
        }
        if (option2.checked) {
            text = '['.repeat(n) + text + ']'.repeat(n);
        }
        if (option1.checked) {
            text = '{'.repeat(n) + text + '}'.repeat(n);
        }

        text += ',';

        const target = targetSelect.value;
        const textarea = document.getElementById('list' + target);
        const separator = option4.checked ? ' ' : '\n';

        if (textarea.value) {
            textarea.value += separator + text;
        } else {
            textarea.value = text;
        }
    });

    addButton.addEventListener('click', () => {
        listsCount++;
        addList(listsCount);
    });

    combineButton.addEventListener('click', () => {
        const separator = option4.checked ? ' ' : '\n\n';
        let combinedText = '';
        for (let i = 1; i <= listsCount; i++) {
            const list = document.getElementById('list' + i);
            if (list && list.value.trim()) {
                if (combinedText) {
                    combinedText += separator;
                }
                combinedText += list.value.trim();
            }
        }
        resultTextarea.value = combinedText;
    });

    copyButton.addEventListener('click', () => {
        const target = targetSelect.value;
        const textarea = document.getElementById('list' + target);
        navigator.clipboard.writeText(textarea.value)
            .catch(err => console.error('Failed to copy: ', err));
    });

    saveButton.addEventListener('click', () => {
        localStorage.setItem(pageId + 'tag', tagInput.value);
        localStorage.setItem(pageId + 'number', numberSelect.value);
        localStorage.setItem(pageId + 'option1', option1.checked);
        localStorage.setItem(pageId + 'option2', option2.checked);
        localStorage.setItem(pageId + 'option3', option3.checked);
        localStorage.setItem(pageId + 'option4', option4.checked);
        localStorage.setItem(pageId + 'target', targetSelect.value);
        localStorage.setItem(pageId + 'listsCount', listsCount);
        if (isPage1 && weightSelect) {
            localStorage.setItem(pageId + 'weight', weightSelect.value);
            if (weightSelect.value === 'custom') {
                localStorage.setItem(pageId + 'customWeight', customWeight.value);
            }
        }
        for (let i = 1; i <= listsCount; i++) {
            const textarea = document.getElementById('list' + i);
            localStorage.setItem(pageId + 'list' + i, textarea.value);
        }
    });

    downloadButton.addEventListener('click', () => {
        const target = targetSelect.value;
        const textarea = document.getElementById('list' + target);
        const text = textarea.value;
        if (!text) {
            alert('No content to download.');
            return;
        }
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tags.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    resetButton.addEventListener('click', () => {
        tagInput.value = '';
        numberSelect.value = '1';
        option1.checked = false;
        option2.checked = false;
        option3.checked = false;
        option4.checked = false;
        listsContainer.innerHTML = '';
        targetSelect.innerHTML = '';
        listsCount = 1;
        addList(1);
        targetSelect.value = '1';
        resultTextarea.value = '';
        if (isPage1 && weightSelect) {
            weightSelect.value = '1.0';
            customWeight.value = '';
            customWeight.style.display = 'none';
        }

        // Clear localStorage
        localStorage.removeItem(pageId + 'tag');
        localStorage.removeItem(pageId + 'number');
        localStorage.removeItem(pageId + 'option1');
        localStorage.removeItem(pageId + 'option2');
        localStorage.removeItem(pageId + 'option3');
        localStorage.removeItem(pageId + 'option4');
        localStorage.removeItem(pageId + 'target');
        localStorage.removeItem(pageId + 'listsCount');
        localStorage.removeItem(pageId + 'weight');
        localStorage.removeItem(pageId + 'customWeight');
        for (let i = 1; i <= listsCount; i++) {
            localStorage.removeItem(pageId + 'list' + i);
        }
    });

    if (nai45Button) {
        nai45Button.addEventListener('click', () => {
            window.location.href = './page1.html';
        });
    }

    if (nai30Button) {
        nai30Button.addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }
});