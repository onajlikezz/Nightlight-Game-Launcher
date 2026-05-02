using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Windows.Forms;

namespace Nightlight_Launcher
{
	// Token: 0x02000006 RID: 6
	public partial class RDR2 : Form
	{
		// Token: 0x0600001F RID: 31 RVA: 0x00004664 File Offset: 0x00002864
		public RDR2()
		{
			this.InitializeComponent();
		}

		// Token: 0x06000020 RID: 32 RVA: 0x0000467C File Offset: 0x0000287C
		private void button1_Click(object sender, EventArgs e)
		{
			bool flag = string.IsNullOrWhiteSpace(this.selectedFolderTextBox.Text);
			bool flag2 = flag;
			if (flag2)
			{
				this.button3_Click(sender, e);
			}
			else
			{
				this.DownloadFiles();
			}
		}

		// Token: 0x06000021 RID: 33 RVA: 0x000046B8 File Offset: 0x000028B8
		private void button2_Click(object sender, EventArgs e)
		{
			string text = this.selectedFolderPath + "\\RDR2Launcher.exe";
			bool flag = File.Exists(text);
			bool flag2 = flag;
			bool flag3 = flag2;
			bool flag4 = flag3;
			if (flag4)
			{
				try
				{
					Process.Start(text);
				}
				catch (Exception ex)
				{
					MessageBox.Show("An error occurred while launching the application: " + ex.Message);
				}
			}
			else
			{
				MessageBox.Show("The file Launcher.exe was not found at the location: " + text);
			}
		}

		// Token: 0x06000022 RID: 34 RVA: 0x00004738 File Offset: 0x00002938
		private void button3_Click(object sender, EventArgs e)
		{
			using (FolderBrowserDialog folderBrowserDialog = new FolderBrowserDialog())
			{
				DialogResult dialogResult = folderBrowserDialog.ShowDialog();
				bool flag = dialogResult == DialogResult.OK && !string.IsNullOrWhiteSpace(folderBrowserDialog.SelectedPath);
				bool flag2 = flag;
				bool flag3 = flag2;
				bool flag4 = flag3;
				bool flag5 = flag4;
				if (flag5)
				{
					this.selectedFolderPath = folderBrowserDialog.SelectedPath;
					this.selectedFolderTextBox.Text = this.selectedFolderPath;
				}
			}
		}

		// Token: 0x06000023 RID: 35 RVA: 0x000047BC File Offset: 0x000029BC
		private void textBox1_TextChanged(object sender, EventArgs e)
		{
			this.selectedFolderPath = this.selectedFolderTextBox.Text;
		}

		// Token: 0x06000024 RID: 36 RVA: 0x000047D0 File Offset: 0x000029D0
		private void DownloadFiles()
		{
			Dictionary<string, string> dictionary = new Dictionary<string, string>
			{
				{
					"RDR2.exe",
					"https://github.com/onajlikezz/rdr2host/releases/download/nlglhost1/RDR2.exe"
				},
				{
					"1911.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/RDR2/1911.dll"
				},
				{
					"Launcher.exe",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/RDR2/Launcher.exe"
				},
				{
					"bink2w64.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/RDR2/bink2w64.dll"
				},
				{
					"RDR2Launcher.exe",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/RDR2/RDR2Launcher.exe"
				}
			};
			string path = this.selectedFolderPath + "\\RDR2.exe";
			bool flag = File.Exists(path);
			if (flag)
			{
				string command = "powershell -Command \"& {Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(0, 'NLGL Information', 'The location you entered probably contains the game!', [System.Windows.Forms.ToolTipIcon]::None)}\"";
				RDR2.ExecuteCommand(command);
				foreach (KeyValuePair<string, string> keyValuePair in dictionary)
				{
					string key = keyValuePair.Key;
					string value = keyValuePair.Value;
					string fileName = Path.Combine(this.selectedFolderPath, key);
					try
					{
						using (WebClient webClient = new WebClient())
						{
							webClient.DownloadFile(value, fileName);
						}
					}
					catch (Exception ex)
					{
						MessageBox.Show("Error downloading file '" + key + "': " + ex.Message);
					}
				}
				MessageBox.Show("The game has been successfully bypassed!\nGame Location: " + this.selectedFolderPath, "Information", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
			}
			else
			{
				string command2 = "powershell -Command \"& {Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(0, 'NLGL Information', 'The location you entered probably does not contain the game!', [System.Windows.Forms.ToolTipIcon]::None)}\"";
				RDR2.ExecuteCommand(command2);
				foreach (KeyValuePair<string, string> keyValuePair2 in dictionary)
				{
					string key2 = keyValuePair2.Key;
					string value2 = keyValuePair2.Value;
					string fileName2 = Path.Combine(this.selectedFolderPath, key2);
					try
					{
						using (WebClient webClient2 = new WebClient())
						{
							webClient2.DownloadFile(value2, fileName2);
						}
					}
					catch (Exception ex2)
					{
						MessageBox.Show("Error downloading file '" + key2 + "': " + ex2.Message);
					}
				}
				MessageBox.Show("The bypass files have been downloaded to the location:\n" + this.selectedFolderPath + "\n\nNote: NLGL did not detect that the game is installed at this location! You may encounter issues when trying to run it.", "Information", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
			}
		}

		// Token: 0x06000025 RID: 37 RVA: 0x00004A4C File Offset: 0x00002C4C
		private void exit_Click(object sender, EventArgs e)
		{
			Application.Exit();
		}

		// Token: 0x06000026 RID: 38 RVA: 0x00004A58 File Offset: 0x00002C58
		private void OpenGameLocation_Click(object sender, EventArgs e)
		{
			bool flag = Directory.Exists(this.selectedFolderPath);
			if (flag)
			{
				Process.Start("explorer.exe", this.selectedFolderPath);
			}
			else
			{
				MessageBox.Show("The folder path is not valid. Please enter a valid folder path.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		// Token: 0x06000027 RID: 39 RVA: 0x00004AA0 File Offset: 0x00002CA0
		private static void ExecuteCommand(string command)
		{
			ProcessStartInfo processStartInfo = new ProcessStartInfo("cmd.exe", "/c " + command);
			processStartInfo.CreateNoWindow = true;
			processStartInfo.UseShellExecute = false;
			processStartInfo.RedirectStandardOutput = true;
			processStartInfo.RedirectStandardError = true;
			Process process = new Process();
			process.StartInfo = processStartInfo;
			process.Start();
			string str = process.StandardOutput.ReadToEnd();
			string str2 = process.StandardError.ReadToEnd();
			process.WaitForExit();
			Console.WriteLine("Output: " + str);
			Console.WriteLine("Error: " + str2);
		}

		// Token: 0x04000025 RID: 37
		private string selectedFolderPath;
	}
}
