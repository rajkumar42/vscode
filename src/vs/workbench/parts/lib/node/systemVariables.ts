/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as Paths from 'vs/base/common/paths';
import URI from 'vs/base/common/uri';
import { AbstractSystemVariables } from 'vs/base/common/parsers';

import * as WorkbenchEditorCommon from 'vs/workbench/common/editor';

import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

export class SystemVariables extends AbstractSystemVariables {
	private _workspaceRoot: string;
	private _execPath: string;

	// Optional workspaceRoot there to be used in tests.
	constructor(
		private editorService: IWorkbenchEditorService,
		contextService: IWorkspaceContextService,
		environmentService: IEnvironmentService,
		workspaceRoot: URI = null,
		envVariables: { [key: string]: string } = process.env
	) {
		super();
		let fsPath = '';
		if (workspaceRoot || (contextService && contextService.getWorkspace())) {
			fsPath = workspaceRoot ? workspaceRoot.fsPath : contextService.getWorkspace().resource.fsPath;
		}
		this._workspaceRoot = Paths.normalize(fsPath, true);
		this._execPath = environmentService.execPath;
		Object.keys(envVariables).forEach(key => {
			this[`env.${key}`] = envVariables[key];
		});
	}

	public get execPath(): string {
		return this._execPath;
	}

	public set execPath(value: string) {
		this._execPath = value;
	}

	public get cwd(): string {
		return this.workspaceRoot;
	}

	public get workspaceRoot(): string {
		return this._workspaceRoot;
	}

	public get file(): string {
		return this.getFilePath();
	}

	public get relativeFile(): string {
		return (this.workspaceRoot) ? Paths.relative(this.workspaceRoot, this.file) : this.file;
	}

	public get fileBasename(): string {
		return Paths.basename(this.getFilePath());
	}

	public get fileDirname(): string {
		return Paths.dirname(this.getFilePath());
	}

	public get fileExtname(): string {
		return Paths.extname(this.getFilePath());
	}

	private getFilePath(): string {
		let input = this.editorService.getActiveEditorInput();
		if (!input) {
			return '';
		}
		let fei = WorkbenchEditorCommon.asFileEditorInput(input);
		if (!fei) {
			return '';
		}
		let resource = fei.getResource();
		return Paths.normalize(resource.fsPath, true);
	}
}