import type { IDisplay } from "dataforged";

/**
 * Returns one random icon href for the given display.
 */
export function getIconHref(display: IDisplay): string | undefined {
	return getIconHrefs(display)[
		Math.floor(Math.random() * getIconHrefs(display).length)
	];
}

/**
 * Returns all valid icon hrefs for the given display.
 */
function getIconHrefs(display: IDisplay): string[] {
	return [
		...(display.Images?.map((image) =>
			image.replace(
				"../../img/raster/",
				"https://raw.githubusercontent.com/rsek/dataforged/refs/heads/main/img/raster/",
			),
		) ?? []),
		display.Icon?.replace(
			/\.\.\/\.\.\/img\/vector\/(Oracles)?/,
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Oracles/",
		).replace(".svg", ".png"),
	].filter((href) => href !== undefined);
}
