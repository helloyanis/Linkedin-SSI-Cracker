document.addEventListener('DOMContentLoaded', function() {
    //Load the saved data
    browser.storage.local.get().then(function(data) {
        const form = document.querySelector("#ssi-form");
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = form.querySelector(`[name="${key}"]`);
                if (element) {
                    element.value = data[key];
                }
            }
        }
    });

    //Save the data
    document.querySelector("#ssi-form").addEventListener("submit", async function(e) {
        e.preventDefault();
        const form = document.querySelector("#ssi-form");
        const data = new FormData(form);

        const storageData = {};
        data.forEach(function(value, key) {
            storageData[key] = value;
        });

        await browser.storage.local.set(storageData);
        document.querySelector("#submit").value = "✔️ OK! Refresh the page to see changes.";
        return false;
    });
});
