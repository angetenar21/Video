const express = require( 'express' );
const app = express();
const server = require( 'http' ).Server( app );
const io = require( 'socket.io' )( server );
const stream = require( './ws/stream' );
const path = require( 'path' );

const PORT = process.env.PORT || 3000;

// Serve the compiled React/Vite frontend from client/dist (production)
const clientDist = path.join( __dirname, '..', 'client', 'dist' );
app.use( express.static( clientDist ) );

// Fallback: serve index.html for client-side routing
app.get( '*', ( req, res ) => {
    res.sendFile( path.join( clientDist, 'index.html' ) );
} );

// WebSocket signaling server (unchanged)
io.of( '/stream' ).on( 'connection', stream );

server.listen( PORT, () => {
    console.log( `Server running on http://localhost:${ PORT }` );
} );
