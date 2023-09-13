import './style.css'
import { XMLParser } from 'fast-xml-parser'

window.onload = function () {
    /** @type {HTMLInputElement} */
    const fileInput = document.getElementById( "fileInput" )

    fileInput.onchange = async function ( e ) {
        if ( fileInput.files )
            for ( let file of fileInput.files )
                onUpload( file )
    }
}

function parseXML( xml ) {
    const parser = new XMLParser( { preserveOrder: true, removeNSPrefix: true, ignoreDeclaration: true } )
    return convertXML( parser.parse( xml ) )
}

function xmlText( xml ) { return xml[ 0 ][ "#text" ] }

function convertDict( xml ) {
    let entries = []
    for ( let i = 0; i < xml.dict.length; i += 2 ) {
        let key = convertXML( xml.dict[ i + 0 ] )
        let value = convertXML( xml.dict[ i + 1 ] )
        entries.push( [ key, value ] )
    }
    return Object.fromEntries( entries )
}

function convertXML( xml ) {
    if ( xml instanceof Array ) return xml.map( convertXML )
    if ( xml.dict ) return convertDict( xml )
    if ( xml.real ) return parseFloat( xmlText( xml.real ) )
    if ( xml.string ) return xmlText( xml.string )
    if ( xml.key ) return xmlText( xml.key )

    let entries = Object.entries( xml )
    if ( entries.length > 1 )
        throw new Error( "Cannot convert XML:", JSON.stringify( xml ) )
    if ( entries.length == 0 )
        return undefined

    let [ type, tags ] = entries[ 0 ]
    return { type, tags: convertXML( tags ) }
}

/** @param {File} file  */
async function onUpload( file ) {
    let { name } = file
    name = name.match( /^(\w+)\.\w+$/ )[ 1 ]

    const itermXML = await file.text()
    const itermSchemeTags = parseXML( itermXML )
    const schemeList = itermSchemeTags.find( x => x.type === "plist" ).tags[ 0 ]

    // console.log( JSON.stringify( schemeList, null, 1 ) )

    // Color mappings taken from: https://rakhesh.com/powershell/converting-iterm2-colours-to-windows-terminal-colors/
    const colorMapping = {
        "Ansi 0 Color": "black",
        "Ansi 1 Color": "red",
        "Ansi 2 Color": "green",
        "Ansi 3 Color": "yellow",
        "Ansi 4 Color": "blue",
        "Ansi 5 Color": "purple",
        "Ansi 6 Color": "cyan",
        "Ansi 7 Color": "white",
        "Ansi 8 Color": "brightBlack",
        "Ansi 9 Color": "brightRed",
        "Ansi 10 Color": "brightGreen",
        "Ansi 11 Color": "brightYellow",
        "Ansi 12 Color": "brightBlue",
        "Ansi 13 Color": "brightPurple",
        "Ansi 14 Color": "brightCyan",
        "Ansi 15 Color": "brightWhite",
        "Cursor Color": "cursorColor",
        "Selection Color": "selectionBackground",
        "Background Color": "background",
        "Foreground Color": "foreground",
    }


    function colorToHex( colorXML ) {
        const R = "Red Component"
        const G = "Green Component"
        const B = "Blue Component"
        let color = [ colorXML[ R ], colorXML[ G ], colorXML[ B ] ]
        return "#" + color.map( x => Math.floor( x * 255 ).toString( 16 ) ).join( "" ).toUpperCase()
    }

    const winTermScheme = Object.fromEntries(
        Object.entries( schemeList ).map(
            ( [ key, color ] ) => [
                colorMapping[ key ],
                colorToHex( color )
            ]
        ).filter(
            ( [ key, _color ] ) => key !== undefined
        ).concat( [ [ "name", name ] ] )
    )

    const output = document.getElementById( "output" )
    output.value = JSON.stringify( winTermScheme, null, 2 )
}

