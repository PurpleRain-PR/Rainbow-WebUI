function/* void */ newWindow(/* void */) {
    const DOMobj_button = document.querySelector('button');
    DOMobj_button.addEventListener('click', () => initWindow());
} newWindow();