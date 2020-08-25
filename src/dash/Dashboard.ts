/**
 * @author: William Hayward
 */

import * as http from 'http';
import * as https from 'https';
import * as express from 'express';

export class Dashboard {
    private http: http.Server | https.Server;
    
    constructor(http: http.Server | https.Server) {
      this.http = http;
      const app = express();
      this.http.on('request', app);

      app.get('/admin', (req, res) => {
        res.send('Hello World');
      });
    }
}
