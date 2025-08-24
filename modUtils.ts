export function modLevelMetadata(mods, data){
    if(mods.includes("View in editor")) data.Clear = true;
    if(mods.includes("View in editor")) data.FullClear = true;
    if(mods.includes("Level stats")) data.Description = `${data.PlayCount} plays, ${data.NumThumbsDown} thumbs down - ` + data.Description;
    return data;
}