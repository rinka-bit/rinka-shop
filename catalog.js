/*
=========================================
RINKA PUBLIC CATALOG
=========================================
*/

window.RinkaCatalog =
  window.RinkaCatalog || {};


const RINKA_CATALOG_URL =
  "./data/catalog.json";


const RINKA_CATALOG_CACHE_KEY =
  "rinka_public_catalog_v1";


window.RinkaCatalog.getCached =
  function(){

    try{

      const raw =
        localStorage.getItem(
          RINKA_CATALOG_CACHE_KEY
        );

      if(!raw){
        return null;
      }


      const data =
        JSON.parse(
          raw
        );


      if(
        !data ||
        !Array.isArray(
          data.products
        ) ||
        !Array.isArray(
          data.collections
        )
      ){

        return null;

      }


      return data;


    }catch(error){

      console.warn(
        "Catalog cache read failed:",
        error
      );

      return null;

    }

  };


window.RinkaCatalog.saveCached =
  function(
    data
  ){

    try{

      localStorage.setItem(
        RINKA_CATALOG_CACHE_KEY,
        JSON.stringify({

          ...data,

          cached_at:
            Date.now()

        })
      );


    }catch(error){

      console.warn(
        "Catalog cache save failed:",
        error
      );

    }

  };


window.RinkaCatalog.load =
  async function(){

    const cached =
      window.RinkaCatalog
        .getCached();


    try{

      const response =
        await fetch(
          RINKA_CATALOG_URL,
          {
            cache:"no-cache"
          }
        );


      if(!response.ok){

        throw new Error(
          "HTTP " +
          response.status
        );

      }


      const data =
        await response.json();


      if(
        !data ||
        !Array.isArray(
          data.products
        ) ||
        !Array.isArray(
          data.collections
        )
      ){

        throw new Error(
          "Catalog format ไม่ถูกต้อง"
        );

      }


      window.RinkaCatalog
        .saveCached(
          data
        );


      return {

        ...data,

        source:
          "github"

      };


    }catch(error){

      console.warn(
        "Static catalog failed:",
        error
      );

    }


    if(cached){

      return {

        ...cached,

        source:
          "cache"

      };

    }


    throw new Error(
      "ไม่สามารถโหลดข้อมูลสินค้าได้"
    );

  };
