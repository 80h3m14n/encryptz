import { CommandOptions } from '../types';
declare global {
    var encryptzOptions: CommandOptions | undefined;
}
export declare function parseCommandLineArgs(): CommandOptions;
export declare function executeCommand(command: string): void;
export declare function getCommandOptions(): CommandOptions | null;
//# sourceMappingURL=commands.d.ts.map