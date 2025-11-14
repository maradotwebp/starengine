import type { IOracle, IOracleCategory } from "dataforged";
import {
	ActionRowBuilder,
	type APIMessageTopLevelComponent,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { encodeCustomId } from "@/core/custom-id";
import { randomInRow, randomInt } from "@/core/random";
import { getNext, getPrevious, hasNext, hasPrevious } from "@/core/rows";
import { oracleNewSchema } from "@/interactions/buttons/oracle-new";
import { oracleNudgeSchema } from "@/interactions/buttons/oracle-nudge";
import { oracleRerollSchema } from "@/interactions/buttons/oracle-reroll";
import { getOracleIconHref } from "../icons";
import { Oracle } from "./oracle";
import { OracleCategory } from "./oracle-category";
import { Section } from "./section";

export interface OracleWidgetProps {
	item: IOracle | IOracleCategory;
	/**
	 * The exact value rolled.
	 *
	 * @default randomInt(1, 100)
	 */
	value: number | undefined;
}

export function OracleWidget({
	item,
	value = randomInt(1, 100),
}: OracleWidgetProps): APIMessageTopLevelComponent[] {
	const iconHref = getOracleIconHref(item.Display);

	const itemIsOracle = isOracle(item);

	return [
		Section({
			content: itemIsOracle
				? Oracle({ oracle: item, value })
				: OracleCategory({ category: item }),
			icon: iconHref
				? {
						url: iconHref,
						alt: item.Display.Title,
					}
				: undefined,
		}),
		new ActionRowBuilder<ButtonBuilder>()
			.addComponents([
				new ButtonBuilder()
					.setCustomId(encodeCustomId(oracleNewSchema, { itemId: item.$id }))
					.setEmoji("➕")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(!(item.Usage?.["Max rolls"] || item.Usage?.Repeatable)),
				...(item.Table
					? [
							new ButtonBuilder()
								.setCustomId(
									encodeCustomId(oracleNudgeSchema, {
										itemId: item.$id,
										value: randomInRow(
											getPrevious(item.Table, value) ?? {
												Floor: 1,
												Ceiling: 1,
											},
										),
									}),
								)
								.setEmoji("⬆️")
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!hasPrevious(item.Table, value)),
							new ButtonBuilder()
								.setCustomId(
									encodeCustomId(oracleNudgeSchema, {
										itemId: item.$id,
										value: randomInRow(
											getNext(item.Table, value) ?? {
												Floor: 100,
												Ceiling: 100,
											},
										),
									}),
								)
								.setEmoji("⬇️")
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!hasNext(item.Table, value)),
						]
					: []),
				new ButtonBuilder()
					.setCustomId(encodeCustomId(oracleRerollSchema, { itemId: item.$id }))
					.setEmoji("🔄")
					.setStyle(ButtonStyle.Secondary),
			])
			.toJSON(),
	];
}

function isOracle(oracle: IOracle | IOracleCategory): oracle is IOracle {
	return "Table" in oracle && !!oracle.Table && oracle.Table.length > 0;
}
