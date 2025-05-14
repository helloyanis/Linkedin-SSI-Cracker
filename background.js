console.log("Script is running");
// Intercepte la réponse pour l'URL spécifiée
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
      console.log("Request intercepted:", details.url); 
      const filter = browser.webRequest.filterResponseData(details.requestId);
  
      let decoder = new TextDecoder("utf-8");
      let encoder = new TextEncoder();
  
      // Écoute les données en streaming
      let response = '';
      filter.ondata = event => {
        response += decoder.decode(event.data, { stream: true });
      };
  
      // Fin du streaming
      filter.onstop = async () => {
        try {
          // Parse la réponse JSON
          let jsonData = JSON.parse(response);
  
          // Charge les données personnalisées depuis le storage local
          const userModifications = await browser.storage.local.get();
  
          // Applique vos modifications
          if(jsonData.memberScore) {
            // Graph principal avec les sous-scores
            jsonData.memberScore.subScores.forEach(subScore => {
              if (userModifications[subScore.pillar]) {
                subScore.score = parseFloat(userModifications[subScore.pillar]);
              }
            })
          }
          if(jsonData.groupScore ) {
            // Classement
            jsonData.groupScore.forEach(group => {
              if (userModifications[group.groupType]) {
                group.rank = parseFloat(userModifications[group.groupType]);
              }
            })
          }
          

        console.log("jsonData", jsonData);
  
          // Renvoie les données modifiées
          const modifiedResponse = encoder.encode(JSON.stringify(jsonData));
          filter.write(modifiedResponse);
        } catch (e) {
          console.error("Error processing response: ", e);
        } finally {
          filter.close();
        }
      };
  
      // En cas d'erreur
      filter.onerror = event => {
        console.error("Error in filter:", event.error);
        filter.close();
      };
    },
    { urls: ["https://www.linkedin.com/sales-api/salesApiSsi"] },
    ["blocking"]
  );