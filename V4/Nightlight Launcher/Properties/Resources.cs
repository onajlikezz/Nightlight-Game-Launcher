using System;
using System.CodeDom.Compiler;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.Resources;
using System.Runtime.CompilerServices;

namespace Nightlight_Launcher.Properties
{
	// Token: 0x02000007 RID: 7
	[GeneratedCode("System.Resources.Tools.StronglyTypedResourceBuilder", "16.0.0.0")]
	[DebuggerNonUserCode]
	[CompilerGenerated]
	internal class Resources
	{
		// Token: 0x0600002A RID: 42 RVA: 0x00005116 File Offset: 0x00003316
		internal Resources()
		{
		}

		// Token: 0x17000001 RID: 1
		// (get) Token: 0x0600002B RID: 43 RVA: 0x00005120 File Offset: 0x00003320
		[EditorBrowsable(EditorBrowsableState.Advanced)]
		internal static ResourceManager ResourceManager
		{
			get
			{
				bool flag = Resources.resourceMan == null;
				if (flag)
				{
					ResourceManager resourceManager = new ResourceManager("Nightlight_Launcher.Properties.Resources", typeof(Resources).Assembly);
					Resources.resourceMan = resourceManager;
				}
				return Resources.resourceMan;
			}
		}

		// Token: 0x17000002 RID: 2
		// (get) Token: 0x0600002C RID: 44 RVA: 0x00005168 File Offset: 0x00003368
		// (set) Token: 0x0600002D RID: 45 RVA: 0x0000517F File Offset: 0x0000337F
		[EditorBrowsable(EditorBrowsableState.Advanced)]
		internal static CultureInfo Culture
		{
			get
			{
				return Resources.resourceCulture;
			}
			set
			{
				Resources.resourceCulture = value;
			}
		}

		// Token: 0x17000003 RID: 3
		// (get) Token: 0x0600002E RID: 46 RVA: 0x00005188 File Offset: 0x00003388
		internal static Bitmap discordimg
		{
			get
			{
				object @object = Resources.ResourceManager.GetObject("discordimg", Resources.resourceCulture);
				return (Bitmap)@object;
			}
		}

		// Token: 0x17000004 RID: 4
		// (get) Token: 0x0600002F RID: 47 RVA: 0x000051B8 File Offset: 0x000033B8
		internal static Bitmap githubimg
		{
			get
			{
				object @object = Resources.ResourceManager.GetObject("githubimg", Resources.resourceCulture);
				return (Bitmap)@object;
			}
		}

		// Token: 0x17000005 RID: 5
		// (get) Token: 0x06000030 RID: 48 RVA: 0x000051E8 File Offset: 0x000033E8
		internal static Bitmap gta4img
		{
			get
			{
				object @object = Resources.ResourceManager.GetObject("gta4img", Resources.resourceCulture);
				return (Bitmap)@object;
			}
		}

		// Token: 0x17000006 RID: 6
		// (get) Token: 0x06000031 RID: 49 RVA: 0x00005218 File Offset: 0x00003418
		internal static Bitmap gta5img
		{
			get
			{
				object @object = Resources.ResourceManager.GetObject("gta5img", Resources.resourceCulture);
				return (Bitmap)@object;
			}
		}

		// Token: 0x17000007 RID: 7
		// (get) Token: 0x06000032 RID: 50 RVA: 0x00005248 File Offset: 0x00003448
		internal static Bitmap rdr2img
		{
			get
			{
				object @object = Resources.ResourceManager.GetObject("rdr2img", Resources.resourceCulture);
				return (Bitmap)@object;
			}
		}

		// Token: 0x0400002E RID: 46
		private static ResourceManager resourceMan;

		// Token: 0x0400002F RID: 47
		private static CultureInfo resourceCulture;
	}
}
