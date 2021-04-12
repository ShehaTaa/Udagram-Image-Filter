
import express from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { filter } from 'bluebird';
import fs from 'fs'

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  app.get("/filteredimage",
    async ( req: Request, res: Response ) => {
      //GET /filteredimage?image_url={{URL}}
      const { image_url } = req.query   
      // 1. validate the image_url query
      if (!image_url) {
        return res.status(400).send("image_url invalid")
      }
      try {
        // 2. call filterImageFromURL(image_url) to filter the image
        const filteredPhotoUrl = await filterImageFromURL(image_url)
        if (!filteredPhotoUrl) {
          // 3. send the resulting file in the response
          return res.status(400).send("Error filtering image")
        }
        res.addListener("finish", () => {
           // 4. deletes any files on the server on finish of the response
          console.log(`removing image ${filteredPhotoUrl} ...`)
          
          fs.unlink(filteredPhotoUrl, (error) => {
            if (error) console.log(`error cleaning up image ${filteredPhotoUrl}`)
            else console.log(`image ${filteredPhotoUrl} removed`)
          })
        } )
        return res.status(200).sendFile(filteredPhotoUrl)

      } catch(error) {
        return res.status(422).send("Image could not be processed")
      }

    }
  )
  
 
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();